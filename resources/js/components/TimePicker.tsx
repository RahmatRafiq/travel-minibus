import React from "react";

type TimePickerProps = {
    id?: string;
    value?: string;
    onChange?: (time: string) => void;
    format?: string;
    required?: boolean;
    className?: string;
    label?: string;
};

export function TimePicker({
    id,
    value,
    onChange,
    required,
    className = "",
    label,
}: TimePickerProps) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                type="time"
                id={id}
                value={value || ""}
                onChange={e => onChange?.(e.target.value)}
                required={required}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-150 bg-white text-gray-800 shadow-sm"
            />
        </div>
    );
}
