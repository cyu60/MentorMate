import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X } from "lucide-react";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<boolean>;
  canEdit?: boolean;
  isLoading?: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  renderDisplay?: (value: string) => React.ReactNode;
}

export function EditableField({
  value,
  onSave,
  canEdit = false,
  isLoading = false,
  multiline = false,
  placeholder,
  className = "",
  displayClassName = "",
  inputClassName = "",
  renderDisplay,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  const handleEdit = () => {
    if (!canEdit || isLoading) return;
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedValue.trim() && editedValue !== value) {
      setIsSaving(true);
      const success = await onSave(editedValue.trim());
      if (success) {
        setIsEditing(false);
      }
      setIsSaving(false);
    } else {
      setIsEditing(false);
      setEditedValue(value);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;
    
    return (
      <div className={`space-y-3 ${className}`}>
        <InputComponent
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          className={`border-2 border-blue-500 ${inputClassName} ${
            multiline ? 'min-h-[100px]' : ''
          }`}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
          disabled={isSaving || isLoading}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative inline-flex items-start ${canEdit && !isLoading ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleEdit}
      title={canEdit && !isLoading ? "Click to edit" : undefined}
    >
      <div className={`group-hover:text-blue-600 transition-colors ${displayClassName}`}>
        {renderDisplay ? renderDisplay(value) : value}
      </div>
      {canEdit && !isLoading && (
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            <Edit2 className="h-3 w-3 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
} 