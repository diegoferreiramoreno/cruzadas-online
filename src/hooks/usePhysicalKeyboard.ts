import { useEffect } from 'react';

interface UsePhysicalKeyboardOptions {
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}

export function usePhysicalKeyboard({
  onLetter,
  onEnter,
  onBackspace,
  disabled = false
}: UsePhysicalKeyboardOptions) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore browser shortcuts
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        onEnter();
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        onBackspace();
      } else if (/^[a-zA-ZáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]$/.test(event.key)) {
        event.preventDefault();
        onLetter(event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLetter, onEnter, onBackspace, disabled]);
}
