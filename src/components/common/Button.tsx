import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  isLoading = false,
  children, 
  disabled,
  className = '',
  ...props 
}: ButtonProps) => {
  const baseStyles = {
    borderRadius: 'var(--border-radius)',
    border: '1px solid transparent',
    fontWeight: '500',
    fontFamily: 'inherit',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const sizeStyles = {
    small: { padding: '0.4em 0.8em', fontSize: '0.875em' },
    medium: { padding: '0.6em 1.2em', fontSize: '1em' },
    large: { padding: '0.8em 1.6em', fontSize: '1.125em' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      borderColor: 'var(--primary-color)',
    },
    secondary: {
      backgroundColor: 'var(--surface-color)',
      color: 'var(--text-color)',
      borderColor: 'var(--border-color)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--primary-color)',
      borderColor: 'var(--primary-color)',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled || isLoading ? 0.6 : 1,
  };

  return (
    <button
      style={combinedStyles}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {isLoading && <div className="spinner" style={{ width: '16px', height: '16px' }} />}
      {children}
    </button>
  );
};
