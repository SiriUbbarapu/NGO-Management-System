import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "neumorphic-input flex h-12 w-full px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
