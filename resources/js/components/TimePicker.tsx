

import * as React from "react";
import { TimePicker as MuiTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/id";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.locale("id");

type TimePickerProps = {
    id?: string;
    value?: string;
    onChange?: (time: string) => void;
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
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
                <MuiTimePicker
                    ampm={false}
                    minutesStep={5}
                    value={value ? dayjs(value, "HH:mm") : null}
                    onChange={val => {
                        if (val && dayjs(val).isValid()) {
                            onChange?.(dayjs(val).format("HH:mm"));
                        } else {
                            onChange?.("");
                        }
                    }}
                    slotProps={{
                        textField: {
                            id,
                            required,
                            size: "small",
                            fullWidth: true,
                            placeholder: "Pilih jam keberangkatan",
                            InputProps: {
                                startAdornment: (
                                    <span className="mr-2 text-gray-400">
                                        <AccessTimeIcon fontSize="small" />
                                    </span>
                                ),
                            },
                            className: "px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition duration-150 bg-white text-gray-800 shadow-sm placeholder:text-gray-400",
                        } as any,
                    }}
                    sx={{
                        '& .MuiInputBase-root': {
                            borderRadius: '0.5rem',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d1d5db',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3b82f6',
                        },
                    }}
                />
            </LocalizationProvider>
        </div>
    );
}
