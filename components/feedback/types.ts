export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  exiting?: boolean;
};

export type ToastInput = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

export type ToastApi = {
  show: (input: ToastInput) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
};
