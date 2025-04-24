import React from 'react';

interface DividerProps {
  children?: React.ReactNode;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ children, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-px bg-[#E6E6E6]" />
      {children && <div className="text-[#828282] text-sm">{children}</div>}
      <div className="flex-1 h-px bg-[#E6E6E6]" />
    </div>
  );
};

export default Divider;
