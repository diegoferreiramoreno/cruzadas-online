using Cruzadas.Application.Common;
using Cruzadas.Application.DTOs;
using Cruzadas.Application.Interfaces;
using Cruzadas.Domain.Entities;
using Cruzadas.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Cruzadas.Application.Services;

public class QuizService : IQuizService
{
    private readonly ICruzadasDbContext _context;
    private readonly ILogger<QuizService> _logger;
    private readonly IAppLogger? _appLogger;

    public QuizService(ICruzadasDbContext context, ILogger<QuizService> logger, IAppLogger? appLogger = null)
    {
        _context = context;
        _logger = logger;
        _appLogger = appLogger;
    }

    public async Task<IReadOnlyList<QuizGroupDto>> GetQuizGroupsAsync(CancellationToken cancellationToken = default)
    {
        var groups = await _context.QuizGroups
            .AsNoTracking()
            .Include(g => g.Quizzes.Where(q => q.IsPublished))
            .OrderBy(g => g.DisplayOrder)
            .ToListAsync(cancellationToken);

        return groups.Select(g => new QuizGroupDto(
            Id: g.Id,
            Name: g.Name,
            Slug: g.Slug,
            Description: g.Description,
            Icon: g.Icon,
            DisplayOrder: g.DisplayOrder,
            Quizzes: g.Quizzes.Select(q => new GameItemDto(
                Id: q.Id.ToString(),
                Title: q.Title,
                Slug: q.Slug,
                Description: q.Description,
                Category: g.Name,
                Status: "Disponível",
                IsAvailable: true,
                DifficultyLevel: q.DifficultyLevel,
                GroupSlug: g.Slug)).ToList()
        )).ToList();
    }

    public async Task<IReadOnlyList<GameItemDto>> GetGamesCatalogAsync(string? groupSlug = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Quizzes
            .AsNoTracking()
            .Include(q => q.Group)
            .Where(q => q.IsPublished);

        if (!string.IsNullOrWhiteSpace(groupSlug))
        {
            var normalizedGroup = groupSlug.Trim().ToLowerInvariant();
            query = query.Where(q => q.Group != null && q.Group.Slug == normalizedGroup);
        }

        var publishedQuizzes = await query
            .OrderBy(q => q.Group != null ? q.Group.DisplayOrder : 99)
            .ThenBy(q => q.Title)
            .ToListAsync(cancellationToken);

        var games = new List<GameItemDto>();

        // Published playable quizzes
        foreach (var q in publishedQuizzes)
        {
            games.Add(new GameItemDto(
                Id: q.Id.ToString(),
                Title: q.Title,
                Slug: q.Slug,
                Description: q.Description,
                Category: q.Group?.Name ?? "Quiz",
                Status: "Disponível",
                IsAvailable: true,
                DifficultyLevel: q.DifficultyLevel,
                GroupSlug: q.Group?.Slug));
        }

        // Se nenhum filtro específico foi aplicado, inclui os teasers futuros
        if (string.IsNullOrWhiteSpace(groupSlug))
        {
            games.Add(new GameItemDto(
                Id: "future-crossword",
                Title: "Palavras Cruzadas da Tradição",
                Slug: "palavras-cruzadas",
                Description: "Cruzadas bíblicas e históricas para exercitar a memória católica.",
                Category: "Palavras Cruzadas",
                Status: "Em breve",
                IsAvailable: false,
                DifficultyLevel: "Intermediário"));

            games.Add(new GameItemDto(
                Id: "future-wordsearch",
                Title: "Caça-Palavras dos Santos",
                Slug: "caca-palavras",
                Description: "Encontre nomes de santos, virtudes e termos litúrgicos.",
                Category: "Caça-Palavras",
                Status: "Em breve",
                IsAvailable: false,
                DifficultyLevel: "Iniciante"));
        }

        return games;
    }

    public async Task<StartAttemptResponseDto> StartRandomAttemptAsync(CancellationToken cancellationToken = default)
    {
        var publishedSlugs = await _context.Quizzes
            .AsNoTracking()
            .Where(q => q.IsPublished)
            .Select(q => q.Slug)
            .ToListAsync(cancellationToken);

        if (publishedSlugs.Count == 0)
        {
            throw new KeyNotFoundException("Nenhum quiz publicado disponível no momento.");
        }

        var randomSlug = publishedSlugs[Random.Shared.Next(publishedSlugs.Count)];

        _appLogger?.LogInformation(
            category: "Cruzadas.Application.QuizService",
            message: $"Partida rápida sorteada: '{randomSlug}'.",
            eventName: "RandomQuizStarted",
            properties: new { SelectedSlug = randomSlug });

        return await StartAttemptAsync(randomSlug, cancellationToken);
    }

    public async Task<QuizDetailDto> GetQuizBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();

        var quiz = await _context.Quizzes
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Slug == normalizedSlug, cancellationToken);

        if (quiz == null)
        {
            throw new KeyNotFoundException($"Quiz com slug '{slug}' não encontrado.");
        }

        if (!quiz.IsPublished)
        {
            throw new QuizNotPublishedException(quiz.Slug);
        }

        return new QuizDetailDto(
            Id: quiz.Id,
            Title: quiz.Title,
            Slug: quiz.Slug,
            Description: quiz.Description,
            QuestionsPerAttempt: quiz.QuestionsPerAttempt,
            DifficultyLevel: quiz.DifficultyLevel);
    }

    public async Task<StartAttemptResponseDto> StartAttemptAsync(string slug, CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();

        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Slug == normalizedSlug, cancellationToken);

        if (quiz == null)
        {
            throw new KeyNotFoundException($"Quiz com slug '{slug}' não encontrado.");
        }

        if (!quiz.IsPublished)
        {
            throw new QuizNotPublishedException(quiz.Slug);
        }

        var attempt = quiz.StartAttempt();
        _context.QuizAttempts.Add(attempt);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tentativa iniciada. QuizId: {QuizId}, AttemptId: {AttemptId}, Questoes: {Total}",
            quiz.Id, attempt.Id, attempt.TotalQuestions);

        _appLogger?.LogInformation(
            category: "Cruzadas.Application.QuizService",
            message: $"Tentativa de quiz iniciada: '{quiz.Slug}'.",
            eventName: "QuizAttemptStarted",
            properties: new
            {
                AttemptId = attempt.Id,
                QuizId = quiz.Id,
                QuizSlug = quiz.Slug,
                TotalQuestions = attempt.TotalQuestions
            });

        var questionsMap = quiz.Questions.ToDictionary(q => q.Id);
        var orderedAttemptQuestions = attempt.AttemptQuestions.OrderBy(aq => aq.Order).ToList();

        var questionDtos = new List<QuizQuestionDto>();
        foreach (var aq in orderedAttemptQuestions)
        {
            if (questionsMap.TryGetValue(aq.QuestionId, out var q))
            {
                // Never expose IsCorrect to client; randomize options order so the correct answer is not always in the same position
                var options = q.Options
                    .OrderBy(_ => Random.Shared.Next())
                    .Select((o, index) => new AnswerOptionDto(o.Id, o.Text, index + 1))
                    .ToList();

                questionDtos.Add(new QuizQuestionDto(q.Id, q.Text, aq.Order, options));
            }
        }

        return new StartAttemptResponseDto(
            AttemptId: attempt.Id,
            QuizId: quiz.Id,
            QuizTitle: quiz.Title,
            QuizSlug: quiz.Slug,
            TotalQuestions: attempt.TotalQuestions,
            Questions: questionDtos,
            DifficultyLevel: quiz.DifficultyLevel);
    }

    public async Task<QuizResultDto> CompleteAttemptAsync(
        string slug,
        Guid attemptId,
        SubmitAnswersRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();

        Quiz? quiz;
        if (normalizedSlug == "random")
        {
            var attemptInfo = await _context.QuizAttempts
                .AsNoTracking()
                .Select(a => new { a.Id, a.QuizId })
                .FirstOrDefaultAsync(a => a.Id == attemptId, cancellationToken);

            if (attemptInfo == null)
            {
                throw new KeyNotFoundException($"Tentativa '{attemptId}' não encontrada.");
            }

            quiz = await _context.Quizzes
                .AsNoTracking()
                .FirstOrDefaultAsync(q => q.Id == attemptInfo.QuizId, cancellationToken);
        }
        else
        {
            quiz = await _context.Quizzes
                .AsNoTracking()
                .FirstOrDefaultAsync(q => q.Slug == normalizedSlug, cancellationToken);

            // Fallback: se o slug fornecido na rota não corresponder exatamente mas a tentativa existir,
            // resolve o Quiz associado à tentativa
            if (quiz == null)
            {
                var attemptInfo = await _context.QuizAttempts
                    .AsNoTracking()
                    .Select(a => new { a.Id, a.QuizId })
                    .FirstOrDefaultAsync(a => a.Id == attemptId, cancellationToken);

                if (attemptInfo != null)
                {
                    quiz = await _context.Quizzes
                        .AsNoTracking()
                        .FirstOrDefaultAsync(q => q.Id == attemptInfo.QuizId, cancellationToken);
                }
            }
        }

        if (quiz == null)
        {
            throw new KeyNotFoundException($"Quiz com slug '{slug}' não encontrado.");
        }

        var attempt = await _context.QuizAttempts
            .Include(a => a.AttemptQuestions)
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.QuizId == quiz.Id, cancellationToken);

        if (attempt == null)
        {
            throw new KeyNotFoundException($"Tentativa '{attemptId}' não encontrada para o quiz '{slug}'.");
        }

        if (attempt.IsCompleted)
        {
            _appLogger?.LogWarning(
                category: "Cruzadas.Application.QuizService",
                message: $"Tentativa '{attempt.Id}' já foi finalizada anteriormente.",
                eventName: "AttemptAlreadyCompleted",
                properties: new { AttemptId = attempt.Id, QuizSlug = quiz.Slug });

            throw new AttemptAlreadyCompletedException(attempt.Id);
        }

        var attemptQuestionIds = attempt.AttemptQuestions.Select(aq => aq.QuestionId).ToList();

        var questions = await _context.Questions
            .Include(q => q.Options)
            .Where(q => attemptQuestionIds.Contains(q.Id))
            .ToListAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        attempt.Complete(request.Answers ?? [], questions, now);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tentativa finalizada. AttemptId: {AttemptId}, Acertos: {Correct}/{Total} ({Percentage}%)",
            attempt.Id, attempt.CorrectAnswersCount, attempt.TotalQuestions, attempt.ScorePercentage);

        var durationSeconds = attempt.CompletedAt.HasValue
            ? (int)(attempt.CompletedAt.Value - attempt.StartedAt).TotalSeconds
            : (int)(now - attempt.StartedAt).TotalSeconds;

        _appLogger?.LogInformation(
            category: "Cruzadas.Application.QuizService",
            message: $"Tentativa de quiz concluída: '{quiz.Slug}' com nota {attempt.ScorePercentage}%.",
            eventName: "QuizAttemptCompleted",
            properties: new
            {
                AttemptId = attempt.Id,
                QuizId = quiz.Id,
                QuizSlug = quiz.Slug,
                CorrectAnswersCount = attempt.CorrectAnswersCount,
                TotalQuestions = attempt.TotalQuestions,
                ScorePercentage = attempt.ScorePercentage,
                DurationSeconds = durationSeconds
            });

        var questionsMap = questions.ToDictionary(q => q.Id);
        var answersMap = attempt.Answers.ToDictionary(a => a.QuestionId);

        var orderedAttemptQuestions = attempt.AttemptQuestions.OrderBy(aq => aq.Order).ToList();
        var reviews = new List<QuestionReviewDto>();

        foreach (var aq in orderedAttemptQuestions)
        {
            if (!questionsMap.TryGetValue(aq.QuestionId, out var q))
                continue;

            answersMap.TryGetValue(aq.QuestionId, out var ans);

            var correctOpt = q.GetCorrectOption();
            var selectedOpt = ans != null
                ? q.Options.FirstOrDefault(o => o.Id == ans.SelectedOptionId)
                : null;

            reviews.Add(new QuestionReviewDto(
                QuestionId: q.Id,
                QuestionText: q.Text,
                SelectedOptionId: ans?.SelectedOptionId,
                SelectedOptionText: selectedOpt?.Text,
                CorrectOptionId: correctOpt?.Id ?? Guid.Empty,
                CorrectOptionText: correctOpt?.Text ?? "Opção correta",
                IsCorrect: ans?.IsCorrect ?? false,
                Explanation: q.Explanation,
                SourceReference: q.SourceReference));
        }

        return new QuizResultDto(
            AttemptId: attempt.Id,
            QuizId: quiz.Id,
            QuizTitle: quiz.Title,
            TotalQuestions: attempt.TotalQuestions,
            CorrectAnswersCount: attempt.CorrectAnswersCount,
            ScorePercentage: attempt.ScorePercentage,
            StartedAt: attempt.StartedAt,
            CompletedAt: attempt.CompletedAt ?? now,
            Questions: reviews,
            DifficultyLevel: quiz.DifficultyLevel);
    }
}
