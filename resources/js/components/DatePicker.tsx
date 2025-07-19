import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type DatePickerProps = {
    id?: string;
    value?: Date;
    onChange?: (date: Date | null) => void;
    displayFormat?: string;
    locale?: string;
    required?: boolean;
    className?: string;
    label?: string;
};

export function DatePicker({
    id,
    value,
    onChange,
    required,
    className = "",
    label,
}: DatePickerProps) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <ReactDatePicker
                id={id}
                selected={value}
                onChange={date => onChange?.(date as Date)}
                required={required}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700 bg-white shadow-sm"
                placeholderText="Pilih tanggal"
                dateFormat="yyyy-MM-dd"
            />
        </div>
    );
}
