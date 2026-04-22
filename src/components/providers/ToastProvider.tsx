"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { icon: typeof Info; className: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-[var(--color-success)]/25 bg-white text-text-primary",
  },
  error: {
    icon: CircleAlert,
    className: "border-[var(--color-error)]/25 bg-white text-text-primary",
  },
  info: {
    icon: Info,
    className: "border-[var(--color-info)]/25 bg-white text-text-primary",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const { icon: Icon, className } = toneStyles[toast.tone];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={`pointer-events-auto rounded-2xl border p-4 shadow-[var(--shadow-panel)] ${className}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-surface-2 p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{toast.title}</p>
                    {toast.description ? (
                      <p className="mt-1 text-sm text-text-secondary">{toast.description}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss toast"
                    className="rounded-full p-1 text-text-muted transition hover:bg-surface-2 hover:text-text-primary"
                    onClick={() => dismiss(toast.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
