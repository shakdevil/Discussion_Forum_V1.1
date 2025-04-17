import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Question, Answer, InsertAnswer } from '@shared/schema';
import { Calendar, Heart, ArrowLeft, Tag } from 'lucide-react';

type QuestionDetailPageProps = {
  params: { id: string };
};

export function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const questionId = parseInt(params.id);
  const queryClient = useQueryClient();
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch question details
  const { data: question, isLoading: questionLoading } = useQuery({
    queryKey: [`/api/questions/${questionId}`],
    queryFn: async () => {
      const res = await fetch(`/api/questions/${questionId}`);
      if (!res.ok) throw new Error('Failed to fetch question');
      return res.json() as Promise<Question>;
    },
    enabled: !isNaN(questionId)
  });

  // Fetch question answers
  const { data: answers, isLoading: answersLoading } = useQuery({
    queryKey: [`/api/questions/${questionId}/answers`],
    queryFn: async () => {
      const res = await fetch(`/api/questions/${questionId}/answers`);
      if (!res.ok) throw new Error('Failed to fetch answers');
      return res.json() as Promise<Answer[]>;
    },
    enabled: !isNaN(questionId)
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (data: InsertAnswer) => {
      const res = await apiRequest('POST', `/api/questions/${questionId}/answers`, data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch answers
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}/answers`] });
      setAnswerText('');
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Error submitting answer:', error);
      setIsSubmitting(false);
    }
  });

  // Like answer mutation
  const likeAnswerMutation = useMutation({
    mutationFn: async (answerId: number) => {
      const res = await apiRequest('PUT', `/api/answers/${answerId}/reaction`, {});
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch answers
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}/answers`] });
    }
  });

  // Handle answer submission
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (answerText.trim() === '') return;
    
    setIsSubmitting(true);
    submitAnswerMutation.mutate({
      question_id: questionId,
      answer_text: answerText
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Extract tags from a question
  const getTagsArray = (q: Question): string[] => {
    if (!q.tags) return [];
    return q.tags.split(',').map(tag => tag.trim());
  };

  // Sort answers by likes
  const sortedAnswers = answers ? [...answers].sort((a, b) => b.likes - a.likes) : [];

  const isLoading = questionLoading || answersLoading;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button 
        onClick={() => window.history.back()} 
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to questions
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Question Not Found */}
      {!isLoading && !question && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">Question not found</h3>
          <p className="text-muted-foreground mt-1">The question you're looking for doesn't exist or has been removed.</p>
          <a href="/" className="text-primary hover:underline mt-4 inline-block">Return to homepage</a>
        </div>
      )}

      {/* Question Details */}
      {!isLoading && question && (
        <div className="space-y-6">
          <div className="question-card">
            <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
            <p className="whitespace-pre-line mb-6">{question.description}</p>
            
            {question.tags && (
              <div className="flex flex-wrap gap-2 mb-3">
                {getTagsArray(question).map((tag, index) => (
                  <a 
                    key={index} 
                    href={`/?tag=${encodeURIComponent(tag)}`} 
                    className="tag"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </a>
                ))}
              </div>
            )}
            
            <div className="question-meta">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(question.created_at as unknown as string)}
              </span>
            </div>
          </div>

          {/* Answers Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {sortedAnswers.length} {sortedAnswers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            
            {sortedAnswers.length === 0 && (
              <div className="text-center py-6 border rounded-lg bg-secondary/10">
                <p className="text-muted-foreground">No answers yet. Be the first to answer this question!</p>
              </div>
            )}
            
            {sortedAnswers.map((answer) => (
              <div key={answer.id} className="answer-card">
                <p className="answer-text whitespace-pre-line">{answer.answer_text}</p>
                <div className="answer-meta">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(answer.created_at as unknown as string)}
                  </span>
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => likeAnswerMutation.mutate(answer.id)}
                  >
                    <Heart className={`h-4 w-4 ${answer.likes > 0 ? 'fill-primary text-primary' : ''}`} />
                    <span>{answer.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Answer Form */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                className="w-full rounded-md border border-input p-3 min-h-32 text-sm"
                placeholder="Write your answer..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                required
              ></textarea>
              <button
                type="submit"
                className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Post Your Answer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}