namespace Cruzadas.Application.DTOs;

public record GameItemDto(
    string Id,
    string Title,
    string Slug,
    string Description,
    string Category,
    string Status,
    bool IsAvailable,
    string DifficultyLevel = "Iniciante",
    string? GroupSlug = null);

public record QuizGroupDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    string Icon,
    int DisplayOrder,
    IReadOnlyList<GameItemDto> Quizzes);

public record QuizDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string Description,
    int QuestionsPerAttempt,
    string DifficultyLevel = "Iniciante");

public record AnswerOptionDto(
    Guid Id,
    string Text,
    int Order);

public record QuizQuestionDto(
    Guid Id,
    string Text,
    int Order,
    IReadOnlyList<AnswerOptionDto> Options);

public record StartAttemptResponseDto(
    Guid AttemptId,
    Guid QuizId,
    string QuizTitle,
    string QuizSlug,
    int TotalQuestions,
    IReadOnlyList<QuizQuestionDto> Questions,
    string DifficultyLevel = "Iniciante");

public record SubmitAnswersRequestDto(
    Dictionary<Guid, Guid> Answers);

public record QuestionReviewDto(
    Guid QuestionId,
    string QuestionText,
    Guid? SelectedOptionId,
    string? SelectedOptionText,
    Guid CorrectOptionId,
    string CorrectOptionText,
    bool IsCorrect,
    string Explanation,
    string? SourceReference);

public record QuizResultDto(
    Guid AttemptId,
    Guid QuizId,
    string QuizTitle,
    int TotalQuestions,
    int CorrectAnswersCount,
    decimal ScorePercentage,
    DateTimeOffset StartedAt,
    DateTimeOffset CompletedAt,
    IReadOnlyList<QuestionReviewDto> Questions,
    string DifficultyLevel = "Iniciante");
