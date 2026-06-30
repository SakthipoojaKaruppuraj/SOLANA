import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a base pulse skeleton container.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = "", style }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${className}`}
      style={style}
      data-testid="skeleton"
    />
  );
};

/**
 * Skeleton Loader for circles (e.g. token logos).
 */
export const SkeletonCircle: React.FC<SkeletonProps & { size?: number }> = ({
  className = "",
  size = 40,
}) => {
  return (
    <Skeleton
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

/**
 * Skeleton Loader for block cards.
 */
export const SkeletonCard: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`p-6 border border-card-border bg-card-bg rounded-custom shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <SkeletonCircle size={40} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
};

/**
 * Skeleton Loader for simple text rows.
 */
export const SkeletonText: React.FC<SkeletonProps & { rows?: number }> = ({
  className = "",
  rows = 3,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === rows - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
};
