import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

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

export default function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const nodes = useRef(new Map<number, HTMLDivElement>());

  const remove = useCallback((id: number) => {
    const drop = () => setToasts((list) => list.filter((toast) => toast.id !== id));
    const node = nodes.current.get(id);
    if (!node || typeof node.animate !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return drop();
    // Leave quickly: 150 ms down and out, then remove.
    node.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(8px)' }], { duration: 150, easing: 'ease-in', fill: 'forwards' }).onfinish = drop;
  }, []);

  const showToast = useCallback<ToastContextType['showToast']>((message, type = 'info', options = {}) => {
    const id = nextId.current++;
    // One message at a time: a new toast replaces the old one, so they never stack over the controls.
    setToasts([{ id, message, type, ...options }]);
    const expire = () => {
      // Do not take a toast away from under the keyboard: wait while its button has focus.
      if (nodes.current.get(id)?.contains(document.activeElement)) setTimeout(expire, 1500);
      else remove(id);
    };
    setTimeout(expire, options.duration ?? 4000);
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} ref={(node) => { if (node) nodes.current.set(toast.id, node); else nodes.current.delete(toast.id); }}>
            <span>{toast.message}</span>
            {toast.action && (
              // Focus goes to the action (Undo), so a keyboard user reaches it at once and not 20 Tab presses later.
              <button type="button" ref={(button) => button?.focus({ preventScroll: true })} onClick={() => { toast.action?.onAction(); remove(toast.id); }}>{toast.action.label}</button>
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
