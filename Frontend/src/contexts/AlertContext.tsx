import React, { createContext, useState, useContext, ReactNode } from 'react';
import AlertDialog from '../components/ui/AlertDialog';

interface AlertContextProps {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
    type: 'alert' | 'confirm';
    confirmText: string;
    cancelText: string;
    resolvePromise: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    message: '',
    title: '',
    type: 'alert',
    confirmText: 'Yes',
    cancelText: 'No',
    resolvePromise: null,
  });

  const showAlert = (message: string, title = 'Alert'): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        title,
        type: 'alert',
        confirmText: 'OK',
        cancelText: '',
        resolvePromise: () => {
          resolve();
          return true;
        },
      });
    });
  };

  const showConfirm = (
    message: string, 
    title = 'Are You Sure ?', 
    confirmText = 'Yes', 
    cancelText = 'No'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        title,
        type: 'confirm',
        confirmText,
        cancelText,
        resolvePromise: resolve,
      });
    });
  };

  const handleConfirm = () => {
    if (alertState.resolvePromise) {
      alertState.resolvePromise(true);
    }
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (alertState.resolvePromise) {
      alertState.resolvePromise(false);
    }
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertDialog
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextProps => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
