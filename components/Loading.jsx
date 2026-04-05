'use client';

/**
 * Loading Spinner Component
 * Consistent loading indicator across the app
 */
const Loading = ({ size = 'default', fullScreen = false, className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    default: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-gray-400 border-t-gray-800 rounded-full animate-spin ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loading;
