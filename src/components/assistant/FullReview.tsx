import React from 'react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { ReviewResults } from '../../state/types';

interface FullReviewProps {
  isLoading: boolean;
  error: string | null;
  reviewResults: ReviewResults | null;
  onReview: () => void;
}

function convertLegacyResultsToMarkdown(results: any): string {
  if (!results || typeof results !== 'object') return 'Unexpected response from server.';
  const sections: Array<{ title: string; icon: string; items: string[] }> = [
    { title: 'Inconsistencies', icon: '⚠️', items: results.inconsistencies || [] },
    { title: 'Validator Issues', icon: '🐛', items: results.validator_issues || [] },
    { title: 'Checker Issues', icon: '🔍', items: results.checker_issues || [] },
    { title: 'Interactor Issues', icon: '🔄', items: results.interactor_issues || [] },
  ];
  const parts: string[] = [];
  for (const { title, icon, items } of sections) {
    if (Array.isArray(items) && items.length > 0) {
      parts.push(`## ${icon} ${title}`);
      parts.push('');
      for (const item of items) {
        parts.push(`- ${typeof item === 'string' ? item : JSON.stringify(item)}`);
      }
      parts.push('');
    }
  }
  if (parts.length === 0) {
    return '✅ No issues found!';
  }
  return parts.join('\n');
}

export const FullReview: React.FC<FullReviewProps> = ({
  isLoading,
  error,
  reviewResults,
  onReview,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <LoadingSpinner />
        <p className="mt-4 text-sm text-gray-600">Performing full review...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <Button onClick={onReview} className="w-full" variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  if (!reviewResults) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          Perform a comprehensive review of the statement, checker/interactor, and validator.
          Make sure you have a statement selected in one of your statement columns.
          For interactive problems, the interactor will be used instead of the checker.
        </p>
        <Button onClick={onReview} className="w-full" variant="primary">
          Start Full Review
        </Button>
      </div>
    );
  }

  const markdown = typeof reviewResults === 'string'
    ? reviewResults
    : convertLegacyResultsToMarkdown(reviewResults);

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Full Review Results</h2>
        <Button onClick={onReview} size="small" variant="secondary">
          Re-review
        </Button>
      </div>
      <MarkdownRenderer content={markdown} />
    </div>
  );
};

export default FullReview;
