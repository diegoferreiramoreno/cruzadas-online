import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

describe('Fluxo Completo do Quiz Católico no Cruzadas.online', () => {
  const mockGroups = [
    {
      id: 'grp-1',
      name: 'Doutrina e Sacramentos',
      slug: 'doutrina-sacramentos',
      description: 'Fundamentos da fé apostólica',
      icon: 'church',
      displayOrder: 1,
      quizzes: [],
    },
  ];

  const mockGames = [
    {
      id: 'quiz-1',
      title: 'Quiz Católico — Fundamentos da Fé',
      slug: 'fundamentos-da-fe',
      description: 'Teste seus conhecimentos sobre a Sagrada Escritura e sacramentos.',
      category: 'Doutrina e Sacramentos',
      status: 'Disponível',
      isAvailable: true,
      difficultyLevel: 'Iniciante',
      groupSlug: 'doutrina-sacramentos',
    },
    {
      id: 'future-1',
      title: 'Palavras Cruzadas da Tradição',
      slug: 'palavras-cruzadas',
      description: 'Em breve.',
      category: 'Palavras Cruzadas',
      status: 'Em breve',
      isAvailable: false,
    },
  ];

  const mockAttempt = {
    attemptId: 'att-1234',
    quizId: 'quiz-1',
    quizTitle: 'Quiz Católico — Fundamentos da Fé',
    quizSlug: 'fundamentos-da-fe',
    difficultyLevel: 'Iniciante',
    totalQuestions: 2,
    questions: [
      {
        id: 'q-1',
        text: 'Quantos são os sacramentos da Igreja Católica?',
        order: 1,
        options: [
          { id: 'opt-1a', text: '7 sacramentos', order: 1 },
          { id: 'opt-1b', text: '5 sacramentos', order: 2 },
        ],
      },
      {
        id: 'q-2',
        text: 'Quantos livros compõem a Bíblia católica completa?',
        order: 2,
        options: [
          { id: 'opt-2a', text: '73 livros', order: 1 },
          { id: 'opt-2b', text: '66 livros', order: 2 },
        ],
      },
    ],
  };

  const mockResult = {
    attemptId: 'att-1234',
    quizId: 'quiz-1',
    quizTitle: 'Quiz Católico — Fundamentos da Fé',
    difficultyLevel: 'Iniciante',
    totalQuestions: 2,
    correctAnswersCount: 2,
    scorePercentage: 100,
    startedAt: '2026-10-07T10:00:00Z',
    completedAt: '2026-10-07T10:02:00Z',
    questions: [
      {
        questionId: 'q-1',
        questionText: 'Quantos são os sacramentos da Igreja Católica?',
        selectedOptionId: 'opt-1a',
        selectedOptionText: '7 sacramentos',
        correctOptionId: 'opt-1a',
        correctOptionText: '7 sacramentos',
        isCorrect: true,
        explanation: 'Sete sacramentos instituídos por Cristo.',
        sourceReference: 'CIC 1113',
      },
      {
        questionId: 'q-2',
        questionText: 'Quantos livros compõem a Bíblia católica completa?',
        selectedOptionId: 'opt-2a',
        selectedOptionText: '73 livros',
        correctOptionId: 'opt-2a',
        correctOptionText: '73 livros',
        isCorrect: true,
        explanation: '46 no Antigo e 27 no Novo Testamento.',
        sourceReference: 'CIC 120',
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve carregar a home, exibir o catálogo, iniciar a partida, responder e concluir com sucesso', async () => {
    const user = userEvent.setup();

    // Mock fetch calls
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = input.toString();

      if (url.includes('/games/groups')) {
        return Promise.resolve(new Response(JSON.stringify(mockGroups), { status: 200 }));
      }

      if (url.includes('/games')) {
        return Promise.resolve(new Response(JSON.stringify(mockGames), { status: 200 }));
      }

      if (url.includes('/attempts') && !url.includes('/complete')) {
        return Promise.resolve(new Response(JSON.stringify(mockAttempt), { status: 201 }));
      }

      if (url.includes('/complete')) {
        return Promise.resolve(new Response(JSON.stringify(mockResult), { status: 200 }));
      }

      return Promise.reject(new Error(`Unhandled request to ${url}`));
    });

    render(<App />);

    // 1. Catálogo inicial exibido com os grupos
    await waitFor(() => {
      expect(screen.getByText('Quiz Católico — Fundamentos da Fé')).toBeInTheDocument();
      expect(screen.getByText('Palavras Cruzadas da Tradição')).toBeInTheDocument();
      expect(screen.getAllByText('Doutrina e Sacramentos').length).toBeGreaterThan(0);
    });

    // 2. Iniciar partida
    const startButton = screen.getByRole('button', { name: /iniciar partida de quiz católico/i });
    await user.click(startButton);

    // 3. Primeira pergunta
    await waitFor(() => {
      expect(screen.getByText('Questão 1 de 2')).toBeInTheDocument();
      expect(screen.getByText('Nível: Iniciante')).toBeInTheDocument();
      expect(screen.getByText('Quantos são os sacramentos da Igreja Católica?')).toBeInTheDocument();
    });

    // Selecionar alternativa 7 sacramentos
    const opt1 = screen.getByText('7 sacramentos');
    await user.click(opt1);

    // Avançar
    const nextButton = screen.getByRole('button', { name: /próxima questão/i });
    await user.click(nextButton);

    // 4. Segunda pergunta
    await waitFor(() => {
      expect(screen.getByText('Questão 2 de 2')).toBeInTheDocument();
      expect(screen.getByText('Quantos livros compõem a Bíblia católica completa?')).toBeInTheDocument();
    });

    // Selecionar alternativa 73 livros
    const opt2 = screen.getByText('73 livros');
    await user.click(opt2);

    // Concluir quiz
    const finishButton = screen.getByRole('button', { name: /concluir quiz/i });
    await user.click(finishButton);

    // 5. Tela de resultado
    await waitFor(() => {
      expect(screen.getByText('Partida Concluída')).toBeInTheDocument();
      expect(screen.getByText('Nível: Iniciante')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText(/excelente domínio!/i)).toBeInTheDocument();
      expect(screen.getByText('Revisão Detalhada das Respostas')).toBeInTheDocument();
      expect(screen.getByText('CIC 1113')).toBeInTheDocument();
    });

    // 6. Testar botão Jogar Novamente
    const playAgainBtn = screen.getByRole('button', { name: /jogar novamente/i });
    expect(playAgainBtn).toBeInTheDocument();
    await user.click(playAgainBtn);

    await waitFor(() => {
      expect(screen.getByText('Questão 1 de 2')).toBeInTheDocument();
    });
  });

  it('deve permitir iniciar uma partida rápida com quiz aleatório a partir do botão hero da home', async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = input.toString();

      if (url.includes('/games/groups')) {
        return Promise.resolve(new Response(JSON.stringify(mockGroups), { status: 200 }));
      }

      if (url.includes('/games')) {
        return Promise.resolve(new Response(JSON.stringify(mockGames), { status: 200 }));
      }

      if (url.includes('/random/attempts')) {
        return Promise.resolve(new Response(JSON.stringify(mockAttempt), { status: 201 }));
      }

      if (url.includes('/complete')) {
        // Confirma que a URL chamada contém o slug real 'fundamentos-da-fe'
        expect(url).toContain('/quizzes/fundamentos-da-fe/attempts/att-1234/complete');
        return Promise.resolve(new Response(JSON.stringify(mockResult), { status: 200 }));
      }

      return Promise.reject(new Error(`Unhandled request to ${url}`));
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Partida Rápida Desafio')).toBeInTheDocument();
    });

    const quickPlayBtn = screen.getByRole('button', { name: /jogar partida rápida com quiz aleatório/i });
    await user.click(quickPlayBtn);

    await waitFor(() => {
      expect(screen.getByText('Quantos são os sacramentos da Igreja Católica?')).toBeInTheDocument();
    });

    // Responder Q1
    await user.click(screen.getByText('7 sacramentos'));
    await user.click(screen.getByRole('button', { name: /próxima questão/i }));

    // Responder Q2
    await waitFor(() => {
      expect(screen.getByText('Quantos livros compõem a Bíblia católica completa?')).toBeInTheDocument();
    });
    await user.click(screen.getByText('73 livros'));

    // Finalizar Partida
    await user.click(screen.getByRole('button', { name: /concluir quiz/i }));

    // Verificar tela de resultado
    await waitFor(() => {
      expect(screen.getByText('Partida Concluída')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });
});
