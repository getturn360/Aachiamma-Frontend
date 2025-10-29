import { StarIcon } from "lucide-react";
import { Button } from "../ui/button";

function StarRatingComponent({ rating, handleRatingChange }) {
  console.log(rating, "rating");

  return [1, 2, 3, 4, 5].map((star) => (
    <Button
      className={`group p-2 rounded-full transition-all duration-200 transform
        ${star <= rating
          ? "bg-gradient-to-br from-amber-400 via-yellow-400 to-yellow-500 text-white shadow-lg hover:scale-105"
          : "bg-white text-gray-700 hover:bg-yellow-50 hover:scale-105 shadow-sm"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400`}
      variant="outline"
      size="icon"
      onClick={handleRatingChange ? () => handleRatingChange(star) : null}
    >
      <StarIcon
        className={`w-6 h-6 transition-colors duration-200
          ${star <= rating ? "fill-current text-white" : "stroke-current text-yellow-500 group-hover:fill-yellow-200"}`}
      />
    </Button>
  ));
}

export default StarRatingComponent;
