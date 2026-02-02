// src/components/StarRating.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

interface StarRatingProps {
  courseId: string;
  initialRating: number;
  userId: string;
}

const StarRating: React.FC<StarRatingProps> = ({ courseId, initialRating, userId }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    // Fetch the rating from the server if necessary
    const fetchRating = async () => {
      try {
        const response = await axios.get(`/api/ratings?courseId=${courseId}&userId=${userId}`);
        if (response.data && response.data.rating !== undefined) {
          setRating(response.data.rating);
        }
      } catch (error) {
        console.error('Failed to fetch rating:', error);
      }
    };

    fetchRating();
  }, [courseId, userId]);

  const handleRating = async (rate: number) => {
    setRating(rate);

    try {
      await axios.post('/api/ratings', {
        userId,
        courseId,
        rating: rate,
      });
    } catch (error) {
      console.error('Failed to save rating:', error);
    }
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer text-2xl ${
            star <= (hoverRating || rating) ? 'text-yellow-500' : 'text-gray-300'
          }`}
          onClick={() => handleRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
};

export default StarRating;
