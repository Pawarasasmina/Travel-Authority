import React, { ReactNode } from 'react';

interface ProfileFieldProps {
  icon: ReactNode;
  type: string;
  id: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  options?: string[]; // For select dropdown
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  icon,
  type,
  id,
  value,
  isEditing,
  onChange,
  options = [],
}) => {
  // Common classes for form controls
  const inputClasses = `bg-transparent flex-1 outline-none ${isEditing ? 'border-b border-gray-300 focus:border-blue-500' : ''}`;

  return (
    <div className="flex items-center bg-white border rounded-lg p-3">
      <span className="text-gray-600 mr-2">
        {icon}
      </span>
      
      {type === 'select' && isEditing ? (
        <select
          id={id}
          value={value}
          className={inputClasses}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select {id}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === 'date' && isEditing ? (
        <input 
          type="date" 
          id={id}
          value={value !== "Not available" ? value : ""} 
          className={inputClasses}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input 
          type={type} 
          id={id}
          value={value} 
          className={inputClasses}
          readOnly={!isEditing}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default ProfileField;
