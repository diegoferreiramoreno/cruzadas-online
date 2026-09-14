import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 max-h-[90vh] w-[90vw] max-w-lg -translate-x-[50%] -translate-y-[50%] rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl overflow-y-auto border border-slate-200 dark:border-slate-800 focus:outline-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
