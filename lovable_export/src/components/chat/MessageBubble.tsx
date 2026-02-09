import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageBubbleProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant: "user" | "assistant";
  children: React.ReactNode;
  avatarSrc?: string;
  showAvatar?: boolean;
}

export function MessageBubble({
  variant,
  children,
  avatarSrc,
  showAvatar = true,
  className,
  ...props
}: MessageBubbleProps) {
  const isUser = variant === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
        className
      )}
      {...props}
    >
      {showAvatar && (
        <div className="flex-shrink-0">
          {isUser ? (
            <Avatar className="h-8 w-8 border border-luma-glass-border">
              <AvatarFallback className="bg-gradient-primary text-xs font-medium">
                V
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="status-ring p-0.5 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarSrc || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-primary text-xs font-bold">
                  L
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      )}
      
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-gradient-primary text-primary-foreground rounded-br-md"
            : "glass rounded-bl-md text-foreground"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
