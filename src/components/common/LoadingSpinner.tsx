interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner = ({ size = 'medium', className = '' }: LoadingSpinnerProps) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px',
  };

  return (
    <div 
      className={`spinner ${className}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
      }}
      aria-label="Loading..."
      role="status"
    />
  );
};
