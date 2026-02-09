import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 ml-0">
      {/* Avatar placeholder to align with messages */}
      <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0" />
      
      {/* Typing bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-muted/50 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-border/30"
      >
        <div className="flex items-center gap-1">
          <motion.span
            className="w-2 h-2 bg-foreground/40 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-foreground/40 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.span
            className="w-2 h-2 bg-foreground/40 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
