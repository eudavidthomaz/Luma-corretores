import { motion } from "framer-motion";
import { StoryCard } from "./StoryCard";
import { Tables } from "@/integrations/supabase/types";

type Story = Tables<"stories">;
type Category = Tables<"categories">;

interface StoriesGridProps {
  stories: Story[];
  categories?: Category[];
  onStoryClick: (story: Story) => void;
}

export function StoriesGrid({ stories, categories, onStoryClick }: StoriesGridProps) {
  const getCategoryName = (story: Story) => {
    if (story.category_id && categories) {
      const category = categories.find((c) => c.id === story.category_id);
      if (category) return category.name;
    }
    return story.category || "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {stories.map((story, index) => (
        <StoryCard
          key={story.id}
          story={story}
          categoryName={getCategoryName(story)}
          onClick={() => onStoryClick(story)}
          index={index}
        />
      ))}
    </motion.div>
  );
}
