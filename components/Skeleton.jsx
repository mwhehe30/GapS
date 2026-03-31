'use client';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-300/80 ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
