import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Question } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, Search, Tag, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '../hooks/use-websocket';
import { useToast } from '../hooks/use-toast';

export function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // WebSocket connection
  const { lastEvent, readyState } = useWebSocket();
  
  // Handle WebSocket events
  useEffect(() => {
    if (lastEvent) {
      switch (lastEvent.type) {
        case 'NEW_QUESTION':
          // Invalidate questions cache to refresh the list
          queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
          toast({
            title: "New Question Posted",
            description: `${lastEvent.payload.title}`,
            duration: 3000,
          });
          break;
        case 'NEW_ANSWER':
          toast({
            title: "New Answer Added",
            description: "Someone answered a question",
            duration: 3000,
          });
          break;
        case 'LIKE_ANSWER':
          // We don't need to update the UI for likes on home page
          break;
      }
    }
  }, [lastEvent, queryClient, toast]);

  // Fetch all questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ['/api/questions'],
    queryFn: async () => {
      const res = await fetch('/api/questions');
      if (!res.ok) throw new Error('Failed to fetch questions');
      return res.json() as Promise<Question[]>;
    }
  });

  // Function to search questions
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const res = await apiRequest('GET', `/api/questions/search?keyword=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        return data;
      } catch (error) {
        console.error('Error searching questions:', error);
      }
    }
  };

  // Function to filter by tag
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? null : tag);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Extract tags from a question
  const getTagsArray = (question: Question): string[] => {
    if (!question.tags) return [];
    return question.tags.split(',').map(tag => tag.trim());
  };

  // Filter questions by selected tag if any
  const filteredQuestions = selectedTag && questions 
    ? questions.filter(q => getTagsArray(q).includes(selectedTag))
    : questions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold gradient-heading">Discussion Forum</h1>
          {/* WebSocket connection status */}
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" title="Real-time updates">
            {readyState === WebSocket.OPEN ? (
              <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                <Wifi className="h-3 w-3 text-green-700" /><span className="text-green-700 font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded-full">
                <WifiOff className="h-3 w-3 text-red-700" /><span className="text-red-700 font-medium">Offline</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search questions..."
            className="pl-10 h-10 w-full md:w-64 rounded-md border border-input px-3 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* No Questions State */}
      {!isLoading && (!filteredQuestions || filteredQuestions.length === 0) && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No questions found</h3>
          <p className="text-muted-foreground mt-1">Be the first to ask a question!</p>
        </div>
      )}

      {/* Questions List */}
      {filteredQuestions && filteredQuestions.length > 0 && (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="question-card">
              <a href={`/question/${question.id}`} className="question-title hover:text-primary">
                {question.title}
              </a>
              <p className="question-description">{question.description.substring(0, 150)}...</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {getTagsArray(question).map((tag, index) => (
                  <span 
                    key={index} 
                    className={`tag cursor-pointer ${selectedTag === tag ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="question-meta">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(question.created_at as unknown as string)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}