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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50" onClick={type === 'confirm' ? onCancel : onConfirm}></div>
      
      <div className="bg-white rounded-lg w-80 py-6 px-4 shadow-xl z-50">
        <h2 className="text-xl font-semibold mb-6 text-center">{title}</h2>
        
        <div className="flex justify-center gap-4">
          {type === 'confirm' && (
            <>
              <Button 
                onClick={onConfirm}
                className="h-8 px-8 rounded-3xl bg-gradient-to-r from-[#FF7F50] to-[#F15A29] text-white hover:opacity-90"
              >
                {confirmText}
              </Button>
              <Button
                onClick={onCancel}
                className="h-8 px-8 rounded-3xl bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                {cancelText}
              </Button>
            </>
          )}
          
          {type === 'alert' && (
            <Button 
              onClick={onConfirm}
              className="h-10 px-8 rounded-3xl bg-gradient-to-r from-[#FF7F50] to-[#F15A29] text-white hover:opacity-90"
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
