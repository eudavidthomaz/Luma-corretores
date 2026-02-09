import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={suggestion}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 * index }}
        >
          <Button
            variant="chip"
            size="sm"
            onClick={() => onSelect(suggestion)}
            className="px-4"
          >
            {suggestion}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
