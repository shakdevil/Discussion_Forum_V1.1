import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { InsertQuestion } from '@shared/schema';
import { ArrowLeft, X } from 'lucide-react';

export function NewQuestionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    tags?: string;
  }>({});

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

  // Add a tag
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput('');
      }
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
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            className={`w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-input'} p-2 min-h-32 text-sm`}
            placeholder="Include all the information someone would need to answer your question"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags
          </label>
          <div className={`flex flex-wrap items-center gap-2 p-2 rounded-md border ${errors.tags ? 'border-red-500' : 'border-input'}`}>
            {tags.map((tag, index) => (
              <div key={index} className="tag flex items-center">
                <span>{tag}</span>
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <input
              id="tags"
              type="text"
              className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
              placeholder={tags.length === 0 ? "Add up to 5 tags" : ""}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
            />
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