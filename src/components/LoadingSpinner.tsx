import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  text = "Loading...", 
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-b-2 border-primary",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className={cn(
          "text-muted-foreground",
          size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ error, onRetry, className }: ErrorStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4 p-6", className)}>
      <p className="text-destructive text-center">{error}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};