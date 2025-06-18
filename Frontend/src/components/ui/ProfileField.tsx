import React, { ReactNode } from 'react';

interface ProfileFieldProps {
  icon: ReactNode;
  type: string;
  id: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  icon,
  type,
  id,
  value,
  isEditing,
  onChange,
}) => {
  return (
    <div className="flex items-center bg-white border rounded-lg p-3">
      <span className="text-gray-600 mr-2">
        {icon}
      </span>
      <input 
        type={type} 
        id={id}
        value={value} 
        className={`bg-transparent flex-1 outline-none ${isEditing ? 'border-b border-gray-300 focus:border-blue-500' : ''}`} 
        readOnly={!isEditing}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ProfileField;
