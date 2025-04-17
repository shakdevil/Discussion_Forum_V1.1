import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { InsertQuestion } from '@shared/schema';
import { ArrowLeft, X, HelpCircle, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function NewQuestionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    tags?: string;
  }>({});
  
  // Fetch popular tags
  const { data: popularTags, isLoading: tagsLoading } = useQuery({
    queryKey: ['/api/tags/popular'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/tags/popular?limit=10');
      return res.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: InsertQuestion) => {
      const res = await apiRequest('POST', '/api/questions', data);
      return res.json();
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      // Redirect to the new question
      window.location.href = `/question/${data.id}`;
    },
    onError: (error) => {
      console.error('Error creating question:', error);
      setIsSubmitting(false);
      setErrors({ ...errors, title: 'Failed to create question. Please try again.' });
    }
  });

  // Handle tag input change 
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowTagSuggestions(e.target.value.length > 0);
  };
  
  // Add a tag
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput('');
        setShowTagSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
  };
  
  // Add a suggested tag
  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      description?: string;
      tags?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    createQuestionMutation.mutate({
      title,
      description,
      tags: tags.join(',')
    });
  };

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

      <h1 className="text-2xl font-bold">Ask a Question</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            className={`w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-input'} p-2 text-sm`}
            placeholder="What's your question?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Be specific and imagine you're asking a question to another person
          </p>
        </div>
        
        {/* Description */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <div className="tooltip flex items-center text-xs text-blue-600">
              <HelpCircle className="h-4 w-4 mr-1" />
              <span>Markdown supported</span>
            </div>
          </div>
          <textarea
            id="description"
            className={`w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-input'} p-2 min-h-32 text-sm`}
            placeholder="Include all the information someone would need to answer your question. Markdown is supported (e.g. **bold**, *italic*, ```code blocks```, ## headings, etc.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          {description && (
            <div className="mt-3 p-3 border rounded-md">
              <h4 className="text-sm font-medium mb-2">Preview:</h4>
              <div className="markdown-content p-2 bg-gray-50 rounded">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            </div>
          )}
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags
          </label>
          <div className={`flex flex-wrap items-center gap-2 p-2 rounded-md border ${errors.tags ? 'border-red-500' : 'border-input'}`}>
            {tags.map((tag, index) => (
              <div key={index} className="tag flex items-center bg-primary/10 text-primary-foreground px-2 py-1 rounded text-sm">
                <Tag className="h-3 w-3 mr-1 opacity-70" />
                <span>{tag}</span>
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-primary-foreground/70 hover:text-primary-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <div className="relative flex-1">
              <input
                id="tags"
                type="text"
                className="w-full min-w-[100px] outline-none bg-transparent text-sm"
                placeholder={tags.length === 0 ? "Add up to 5 tags" : ""}
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={addTag}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 100)}
              />
              
              {/* Tag suggestions dropdown */}
              {showTagSuggestions && popularTags && popularTags.length > 0 && (
                <div className="absolute left-0 top-6 z-10 w-full bg-background border rounded-md shadow-md p-1 mt-1">
                  {popularTags
                    .filter(tag => 
                      tag.tag.toLowerCase().includes(tagInput.toLowerCase()) && 
                      !tags.includes(tag.tag)
                    )
                    .slice(0, 5)
                    .map((tag, index) => (
                      <div 
                        key={index}
                        className="flex items-center p-1.5 hover:bg-muted rounded cursor-pointer"
                        onClick={() => addSuggestedTag(tag.tag)}
                      >
                        <Tag className="h-3 w-3 mr-2 opacity-70" />
                        <span className="text-sm">{tag.tag}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {tag.count}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Add up to 5 tags to describe what your question is about. Press enter or comma to add a tag.
          </p>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Post Your Question'}
        </button>
      </form>
    </div>
  );
}