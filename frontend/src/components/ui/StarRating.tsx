import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, count, size = 'sm', interactive = false, onRate }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500 ml-1">({count})</span>
      )}
    </div>
  );
}
