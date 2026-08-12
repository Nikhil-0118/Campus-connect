import { forwardRef, type SelectHTMLAttributes } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1 text-left font-sans">
        {label && (
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-md border text-sm transition-all focus:outline-none focus:ring-1 px-3 py-2 bg-white
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/10'
                : 'border-gray-300 focus:border-primary focus:ring-primary'
            }
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-gray-500">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
