// src/context/NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

type NotificationState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

type NotificationContextType = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });

  const show = useCallback((message: string, severity: AlertColor) => {
    setState({ open: true, message, severity });
  }, []);

  const showSuccess = useCallback(
    (message: string) => show(message, "success"),
    [show]
  );

  const showError = useCallback(
    (message: string) => show(message, "error"),
    [show]
  );

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError }}>
      {children}

      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotification debe usarse dentro de un NotificationProvider"
    );
  }
  return ctx;
}
