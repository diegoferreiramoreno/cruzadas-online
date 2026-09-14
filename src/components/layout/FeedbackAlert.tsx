import React from 'react';

interface FeedbackAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

export const FeedbackAlert: React.FC<FeedbackAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDismiss}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-900 font-semibold px-4 py-2 rounded-md shadow-lg transition-all animate-bounce cursor-pointer"
    >
      {message}
    </div>
  );
};
