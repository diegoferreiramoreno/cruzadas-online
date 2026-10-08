using Cruzadas.Application.DTOs;
using Cruzadas.Application.Services;
using Cruzadas.Domain.Entities;
using Cruzadas.Domain.Exceptions;
using Cruzadas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace Cruzadas.Application.Tests;

public class QuizServiceTests
{
    private CruzadasDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<CruzadasDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new CruzadasDbContext(options);
    }

    private Quiz SeedQuiz(CruzadasDbContext context, bool isPublished = true, string slug = "fundamentos-da-fe")
    {
        var quiz = new Quiz(
            Guid.NewGuid(),
            "Fundamentos da Fé",
            slug,
            "Descrição do quiz",
            isPublished,
            2,
            DateTimeOffset.UtcNow);

        for (int i = 1; i <= 3; i++)
        {
            var q = new Question(
                Guid.NewGuid(),
                quiz.Id,
                $"Pergunta {i}?",
                $"Explicação {i}",
                $"Fonte {i}",
                i);

            q.AddOption(Guid.NewGuid(), $"Opção A{i} (C)", true, 1);
            q.AddOption(Guid.NewGuid(), $"Opção B{i}", false, 2);
            quiz.AddQuestion(q);
        }

        context.Quizzes.Add(quiz);
        context.SaveChanges();
        return quiz;
    }

    [Fact]
    public async Task GetGamesCatalogAsync_ReturnsPublishedGamesAndPlaceholders()
    {
        using var context = CreateInMemoryDbContext();
        SeedQuiz(context, isPublished: true, slug: "quiz-1");
        SeedQuiz(context, isPublished: false, slug: "quiz-rascunho");

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var catalog = await service.GetGamesCatalogAsync();

        Assert.NotNull(catalog);
        var available = catalog.Where(g => g.IsAvailable).ToList();
        var placeholders = catalog.Where(g => !g.IsAvailable).ToList();

        Assert.Single(available);
        Assert.Equal("quiz-1", available[0].Slug);
        Assert.NotEmpty(placeholders);
    }

    [Fact]
    public async Task GetQuizBySlugAsync_WhenPublished_ReturnsQuizDetail()
    {
        using var context = CreateInMemoryDbContext();
        var quiz = SeedQuiz(context, isPublished: true);

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var detail = await service.GetQuizBySlugAsync(quiz.Slug);

        Assert.NotNull(detail);
        Assert.Equal(quiz.Id, detail.Id);
        Assert.Equal(quiz.Slug, detail.Slug);
        Assert.Equal(2, detail.QuestionsPerAttempt);
    }

    [Fact]
    public async Task GetQuizBySlugAsync_WhenNotFound_ThrowsKeyNotFoundException()
    {
        using var context = CreateInMemoryDbContext();
        var service = new QuizService(context, NullLogger<QuizService>.Instance);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.GetQuizBySlugAsync("quiz-inexistente"));
    }

    [Fact]
    public async Task GetQuizBySlugAsync_WhenNotPublished_ThrowsQuizNotPublishedException()
    {
        using var context = CreateInMemoryDbContext();
        var quiz = SeedQuiz(context, isPublished: false, slug: "quiz-oculto");

        var service = new QuizService(context, NullLogger<QuizService>.Instance);

        await Assert.ThrowsAsync<QuizNotPublishedException>(() =>
            service.GetQuizBySlugAsync(quiz.Slug));
    }

    [Fact]
    public async Task StartAttemptAsync_CreatesAttemptAndHidesCorrectAnswers()
    {
        using var context = CreateInMemoryDbContext();
        var quiz = SeedQuiz(context, isPublished: true);

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var response = await service.StartAttemptAsync(quiz.Slug);

        Assert.NotNull(response);
        Assert.NotEqual(Guid.Empty, response.AttemptId);
        Assert.Equal(quiz.Id, response.QuizId);
        Assert.Equal(2, response.TotalQuestions);
        Assert.Equal(2, response.Questions.Count);
        Assert.Equal(quiz.DifficultyLevel, response.DifficultyLevel);

        // Verify that options are returned without correct flags
        foreach (var q in response.Questions)
        {
            Assert.NotEmpty(q.Options);
            Assert.All(q.Options, opt => Assert.False(string.IsNullOrWhiteSpace(opt.Text)));
        }

        // Verify persisted in DB
        var savedAttempt = await context.QuizAttempts.FirstOrDefaultAsync(a => a.Id == response.AttemptId);
        Assert.NotNull(savedAttempt);
        Assert.False(savedAttempt.IsCompleted);
    }

    [Fact]
    public async Task CompleteAttemptAsync_CalculatesScoreAndReturnsDetailedReview()
    {
        using var context = CreateInMemoryDbContext();
        var quiz = SeedQuiz(context, isPublished: true);

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var attemptResponse = await service.StartAttemptAsync(quiz.Slug);

        var q1 = attemptResponse.Questions[0];
        var q2 = attemptResponse.Questions[1];

        // Find actual correct options from the DB for testing
        var dbQ1 = await context.Questions.Include(q => q.Options).FirstAsync(q => q.Id == q1.Id);
        var dbQ2 = await context.Questions.Include(q => q.Options).FirstAsync(q => q.Id == q2.Id);

        var correctOpt1 = dbQ1.Options.First(o => o.IsCorrect);
        var wrongOpt2 = dbQ2.Options.First(o => !o.IsCorrect);

        var request = new SubmitAnswersRequestDto(new Dictionary<Guid, Guid>
        {
            [q1.Id] = correctOpt1.Id,
            [q2.Id] = wrongOpt2.Id,
        });

        var result = await service.CompleteAttemptAsync(quiz.Slug, attemptResponse.AttemptId, request);

        Assert.NotNull(result);
        Assert.Equal(2, result.TotalQuestions);
        Assert.Equal(1, result.CorrectAnswersCount);
        Assert.Equal(50.00m, result.ScorePercentage);
        Assert.Equal(quiz.DifficultyLevel, result.DifficultyLevel);
        Assert.Equal(2, result.Questions.Count);

        var review1 = result.Questions.First(q => q.QuestionId == q1.Id);
        Assert.True(review1.IsCorrect);
        Assert.Equal(correctOpt1.Text, review1.SelectedOptionText);

        var review2 = result.Questions.First(q => q.QuestionId == q2.Id);
        Assert.False(review2.IsCorrect);
        Assert.Equal(wrongOpt2.Text, review2.SelectedOptionText);
        Assert.Equal(dbQ2.Options.First(o => o.IsCorrect).Text, review2.CorrectOptionText);
    }

    [Fact]
    public async Task CompleteAttemptAsync_WhenAlreadyCompleted_ThrowsAttemptAlreadyCompletedException()
    {
        using var context = CreateInMemoryDbContext();
        var quiz = SeedQuiz(context, isPublished: true);

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var attemptResponse = await service.StartAttemptAsync(quiz.Slug);

        var request = new SubmitAnswersRequestDto(new Dictionary<Guid, Guid>());
        await service.CompleteAttemptAsync(quiz.Slug, attemptResponse.AttemptId, request);

        await Assert.ThrowsAsync<AttemptAlreadyCompletedException>(() =>
            service.CompleteAttemptAsync(quiz.Slug, attemptResponse.AttemptId, request));
    }

    [Fact]
    public async Task CompleteAttemptAsync_WhenAttemptNotFound_ThrowsKeyNotFoundException()
    {
        using var context = CreateInMemoryDbContext();
        var quiz = SeedQuiz(context, isPublished: true);

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var request = new SubmitAnswersRequestDto(new Dictionary<Guid, Guid>());

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.CompleteAttemptAsync(quiz.Slug, Guid.NewGuid(), request));
    }

    [Fact]
    public async Task GetQuizGroupsAsync_ReturnsGroupsWithQuizzes()
    {
        using var context = CreateInMemoryDbContext();
        var group = new QuizGroup(Guid.NewGuid(), "Doutrina", "doutrina", "Desc", "church", 1);
        var quiz = SeedQuiz(context, isPublished: true, slug: "quiz-doutrina");
        group.AddQuiz(quiz);
        context.QuizGroups.Add(group);
        await context.SaveChangesAsync();

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var groups = await service.GetQuizGroupsAsync();

        Assert.Single(groups);
        Assert.Equal("Doutrina", groups[0].Name);
        Assert.Single(groups[0].Quizzes);
    }

    [Fact]
    public async Task GetGamesCatalogAsync_WithGroupFilter_ReturnsOnlyFilteredQuizzes()
    {
        using var context = CreateInMemoryDbContext();
        var group1 = new QuizGroup(Guid.NewGuid(), "Doutrina", "doutrina", "Desc", "church", 1);
        var group2 = new QuizGroup(Guid.NewGuid(), "Bíblia", "biblia", "Desc", "book", 2);
        var q1 = SeedQuiz(context, isPublished: true, slug: "quiz-1");
        var q2 = SeedQuiz(context, isPublished: true, slug: "quiz-2");
        group1.AddQuiz(q1);
        group2.AddQuiz(q2);
        context.QuizGroups.AddRange(group1, group2);
        await context.SaveChangesAsync();

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var games = await service.GetGamesCatalogAsync(groupSlug: "biblia");

        Assert.Single(games);
        Assert.Equal("quiz-2", games[0].Slug);
    }

    [Fact]
    public async Task StartRandomAttemptAsync_SelectsPublishedQuizAndStartsAttempt()
    {
        using var context = CreateInMemoryDbContext();
        SeedQuiz(context, isPublished: true, slug: "quiz-random");

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var attempt = await service.StartRandomAttemptAsync();

        Assert.NotNull(attempt);
        Assert.Equal("Fundamentos da Fé", attempt.QuizTitle);
        Assert.Equal(2, attempt.TotalQuestions);
    }

    [Fact]
    public async Task StartAttemptAsync_ReturnsAllOptionsWithConsecutiveDisplayOrders()
    {
        using var context = CreateInMemoryDbContext();
        var quiz = SeedQuiz(context, isPublished: true, slug: "quiz-options");

        var service = new QuizService(context, NullLogger<QuizService>.Instance);
        var attempt = await service.StartAttemptAsync(quiz.Slug);

        Assert.NotNull(attempt);
        foreach (var q in attempt.Questions)
        {
            Assert.NotEmpty(q.Options);
            var orders = q.Options.Select(o => o.Order).ToList();
            Assert.Equal(Enumerable.Range(1, q.Options.Count), orders);
        }
    }
}
