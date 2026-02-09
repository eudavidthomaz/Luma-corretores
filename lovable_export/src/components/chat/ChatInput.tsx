import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Mic, Image } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = "Digite sua mensagem...", disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto glass-strong rounded-2xl p-2 flex items-center gap-2"
      >
        <div className="flex items-center gap-1 pl-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="on"
          className="flex-1 bg-transparent border-0 text-base placeholder:text-muted-foreground focus:outline-none touch-manipulation min-h-[44px]"
          style={{ fontSize: '16px' }}
        />

        <div className="flex items-center gap-1 pr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            variant="gradient"
            size="icon-sm"
            disabled={!message.trim()}
            className="rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
