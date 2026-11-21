import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  /** Milliseconds on screen. Default 4000. */
  duration?: number;
  /** One button inside the toast, for example Undo. */
  action?: { label: string; onAction: () => void };
}

interface Toast extends ToastOptions {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => setToasts((list) => list.filter((toast) => toast.id !== id)), []);

  const showToast = useCallback<ToastContextType['showToast']>((message, type = 'info', options = {}) => {
    const id = nextId.current++;
    // One message at a time: a new toast replaces the old one, so they never stack over the controls.
    setToasts([{ id, message, type, ...options }]);
    setTimeout(() => remove(id), options.duration ?? 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            {toast.action && (
              <button type="button" onClick={() => { toast.action?.onAction(); remove(toast.id); }}>{toast.action.label}</button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
