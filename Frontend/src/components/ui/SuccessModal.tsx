import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  onButtonClick?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  message,
  buttonText = 'Continue',
  onClose,
  onButtonClick
}) => {
  // Create ref for auto-focusing the button
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Set focus trap for better accessibility
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      // Focus the button when modal opens
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.focus();
        }
      }, 100);
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div            initial={{ opacity: 0, scale: 0.75, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-[1001] bg-white rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.25)] w-[90%] max-w-md overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="flex justify-end p-2">
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 pb-6 pt-2 flex flex-col items-center">
              <div className="mb-4">                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1 
                  }}
                  className="relative"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="absolute -inset-1 rounded-full bg-green-100 blur-sm"
                  />
                  <CheckCircle size={80} className="text-green-500 relative" />
                </motion.div>
              </div>
              
              <motion.h3 
                className="text-2xl font-bold text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h3>
              
              <motion.p 
                className="text-gray-600 text-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {message}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <Button 
                  ref={buttonRef}
                  onClick={onButtonClick || onClose}
                  fullWidth
                  className="bg-gradient-to-r from-[#FF7F50] to-[#F15A29] text-white hover:opacity-95"
                >
                  {buttonText}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SuccessModal;
