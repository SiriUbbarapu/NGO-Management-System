import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "neumorphic-button text-gray-700 hover:text-gray-900",
    primary: "bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:shadow-xl active:shadow-inner",
    secondary: "bg-gray-200 text-gray-700 shadow-neumorphic hover:shadow-neumorphic-sm",
    outline: "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    kalam: "bg-gradient-to-r from-kalam-orange to-kalam-blue text-white shadow-lg hover:shadow-xl"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
