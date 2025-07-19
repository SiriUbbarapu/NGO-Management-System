import React from 'react';
import { cn } from '../../utils/cn';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "neumorphic-input flex h-12 w-full px-4 py-2 text-sm text-gray-900 bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export { Select };
