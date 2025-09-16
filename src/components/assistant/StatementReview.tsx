import React from 'react';
import { Button } from '../common/Button';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface StatementReviewProps {
  isLoading: boolean;
  error: string | null;
  reviewResults: string | null;
  onReview: () => void;
}

export const StatementReview: React.FC<StatementReviewProps> = ({
  isLoading,
  error,
  reviewResults,
  onReview,
}) => {
  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <Button
          onClick={onReview}
          className="w-full"
          variant="primary"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">Reviewing statement language and clarity...</p>
      </div>
    );
  }

  if (!reviewResults) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Click the button below to start the statement language review.
        </p>
        <Button
          onClick={onReview}
          className="w-full"
          variant="primary"
        >
          Start Statement Review
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MarkdownRenderer content={reviewResults} />
      
      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={onReview}
          className="w-full"
          variant="secondary"
        >
          Review Again
        </Button>
      </div>
    </div>
  );
};
