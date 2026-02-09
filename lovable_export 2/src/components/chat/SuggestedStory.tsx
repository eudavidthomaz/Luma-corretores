import { motion } from "framer-motion";
import { StoryCard } from "@/components/ui/StoryCard";

interface SuggestedStoryProps {
  title: string;
  imageUrl: string;
  description: string;
  onClick?: () => void;
}

export function SuggestedStory({ title, imageUrl, description, onClick }: SuggestedStoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mt-4"
    >
      <p className="text-xs text-muted-foreground mb-2">História sugerida para você:</p>
      <div className="max-w-[200px]">
        <StoryCard
          title={title}
          subtitle={description}
          imageUrl={imageUrl}
          badge="Novo"
          onClick={onClick}
        />
      </div>
    </motion.div>
  );
}
