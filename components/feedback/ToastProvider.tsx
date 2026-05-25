"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type { ToastApi, ToastInput, ToastItem, ToastVariant } from "./types";

const DEFAULT_DURATION_MS = 4200;
const EXIT_ANIMATION_MS = 180;

const ToastContext = createContext<ToastApi | null>(null);

function variantStyles(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "border-emerald-500/20 bg-[#141820]/95";
    case "error":
      return "border-red-500/20 bg-[#141820]/95";
    default:
      return "border-white/[0.12] bg-[#141820]/95";
  }
}

function variantDot(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "bg-emerald-400/80";
    case "error":
      return "bg-red-400/70";
    default:
      return "bg-accent/70";
  }
}

function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md ${
            toast.exiting ? "animate-toast-out" : "animate-toast-in"
          } ${variantStyles(toast.variant)}`}
        >
          <span
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${variantDot(toast.variant)}`}
            aria-hidden="true"
          />
          <p className="text-[13px] leading-snug text-zinc-200">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast))
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
    }, EXIT_ANIMATION_MS);
  }, []);

  const show = useCallback(
    ({ message, variant = "info", duration = DEFAULT_DURATION_MS }: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setToasts((current) => [...current.slice(-4), { id, message, variant }]);

      const timer = window.setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, duration) => show({ message, variant: "success", duration }),
      error: (message, duration) => show({ message, variant: "error", duration }),
      info: (message, duration) => show({ message, variant: "info", duration }),
      dismiss
    }),
    [dismiss, show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}
