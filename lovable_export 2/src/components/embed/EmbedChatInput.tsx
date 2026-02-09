import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface EmbedChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function EmbedChatInput({
  onSend,
  placeholder = "Digite sua mensagem...",
  disabled = false,
}: EmbedChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 p-3 border-t border-border/50 bg-background"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        enterKeyHint="send"
        autoComplete="off"
        className="flex-1 bg-muted/50 border border-border/50 rounded-full px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 touch-manipulation min-h-[44px]"
        style={{ fontSize: '16px' }}
      />
      <Button
        type="submit"
        size="icon"
        variant="gradient"
        disabled={disabled || !message.trim()}
        className="shrink-0 rounded-full h-9 w-9"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
