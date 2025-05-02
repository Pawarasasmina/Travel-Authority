import React from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

interface AlertDialogProps {
  isOpen: boolean;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type: 'alert' | 'confirm';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  message,
  title = 'Alert',
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel,
  type,
}) => {
  if (!isOpen) return null;

  // Use the same styling as seen in the provided example
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black opacity-40" onClick={type === 'confirm' ? onCancel : onConfirm}></div>
      
      {/* Alert/Confirm Dialog */}
      <div className="bg-white rounded-lg w-80 p-6 shadow-lg z-50 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-6 text-center">{title}</h2>
        <p className="mb-8 text-center">{message}</p>
        
        <div className="flex w-full gap-4 justify-center">
          {type === 'confirm' && (
            <>
              <Button
                onClick={onConfirm}
                variant="primary"
                className="w-24"
              >
                {confirmText}
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                className="w-24"
              >
                {cancelText}
              </Button>
            </>
          )}
          
          {type === 'alert' && (
            <Button
              onClick={onConfirm}
              variant="primary"
              className="w-36"
            >
              OK
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertDialog;
