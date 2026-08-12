import { toast } from 'sonner';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      className: 'bg-white border border-emerald-100 text-emerald-800 rounded-lg p-4 shadow-sm font-sans',
    });
  },
  error: (error: any) => {
    let msg = 'Something went wrong. Please try again.';
    if (typeof error === 'string') {
      msg = error;
    } else if (error?.response?.data) {
      const data = error.response.data;
      if (typeof data.error === 'string') {
        msg = data.error;
      } else if (typeof data.detail === 'string') {
        msg = data.detail;
      } else if (typeof data === 'object') {
        // Collect errors from multiple fields
        const errors = Object.entries(data)
          .map(([key, val]) => {
            const fieldName = key.replace('_', ' ');
            const fieldError = Array.isArray(val) ? val[0] : val;
            return `${fieldName}: ${fieldError}`;
          })
          .join('\n');
        if (errors) {
          msg = errors;
        }
      }
    } else if (error?.message) {
      msg = error.message;
    }
    
    toast.error(msg, {
      className: 'bg-white border border-rose-100 text-rose-800 rounded-lg p-4 shadow-sm font-sans',
    });
  },
  info: (message: string) => {
    toast.info(message, {
      className: 'bg-white border border-sky-100 text-sky-800 rounded-lg p-4 shadow-sm font-sans',
    });
  },
  warning: (message: string) => {
    toast.warning(message, {
      className: 'bg-white border border-amber-100 text-amber-800 rounded-lg p-4 shadow-sm font-sans',
    });
  }
};
