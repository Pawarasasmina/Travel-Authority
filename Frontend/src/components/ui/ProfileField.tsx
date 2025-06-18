import React, { ReactNode } from 'react';

interface ProfileFieldProps {
  icon: ReactNode;
  type: string;
  id: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  label?: string;
  options?: { value: string; label: string }[];
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  icon,
  type,
  id,
  value,
  isEditing,
  onChange,
  label,
  options,
}) => {
  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={id}
            value={value}
            className={`bg-transparent flex-1 outline-none ${isEditing ? 'border-b border-gray-300 focus:border-blue-500' : ''}`}
            disabled={!isEditing}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select {label || id}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );      case 'date':
        return (
          <input
            type={isEditing ? 'date' : 'text'}
            id={id}
            value={value}
            placeholder={isEditing ? "Select date" : ""}
            className={`bg-transparent flex-1 outline-none ${isEditing ? 'border-b border-gray-300 focus:border-blue-500' : ''}`}
            readOnly={!isEditing}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      default:
        return (
          <input
            type={type}
            id={id}
            value={value}
            className={`bg-transparent flex-1 outline-none ${isEditing ? 'border-b border-gray-300 focus:border-blue-500' : ''}`}
            readOnly={!isEditing}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex items-center bg-white border rounded-lg p-3">
      <span className="text-gray-600 mr-2">{icon}</span>
      {label && <span className="text-gray-600 mr-2">{label}:</span>}
      {renderField()}
    </div>
  );
};

export default ProfileField;
