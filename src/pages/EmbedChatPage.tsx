import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageSquareOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePublicProfile } from "@/hooks/usePublicData";
import { useCarouselStories } from "@/hooks/useCarouselStories";
import { useCategories } from "@/hooks/useCategories";
import { Tables } from "@/integrations/supabase/types";
import { EmbedChatHeader } from "@/components/embed/EmbedChatHeader";
import { EmbedChatInput } from "@/components/embed/EmbedChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { StoriesCarousel } from "@/components/chat/StoriesCarousel";
import { StoryViewer } from "@/components/story/StoryViewer";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { hasLumaChatAccess } from "@/lib/planLimits";

type StoryChapter = Tables<"story_chapters">;

interface ConversationState {
  phase: string;
  collected_data: {
    name?: string | null;
    service_type?: string | null;
    date?: string | null;
    location?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  };
  heat_level: "cold" | "warm" | "hot";
}

interface Message {
  id: string;
  content: string;
  variant: "user" | "assistant";
  showSuggestions?: boolean;
  showCarousel?: boolean;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface StoryViewerData {
  id: string;
  title: string;
  chapters: StoryChapter[];
  category_id: string | null;
}

// Get persistent visitor ID for cross-session memory
function getOrCreateVisitorId(): string {
  const storageKey = 'luma_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
}

// Get persistent session ID for conversation tracking
function getOrCreateSessionId(): string {
  const storageKey = 'luma_session_id';
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

// Communicate with parent window
function sendToParent(type: string, data?: unknown) {
  if (window.parent !== window) {
    window.parent.postMessage({ source: 'luma-widget', type, data }, '*');
  }
}

export default function EmbedChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    phase: "abertura",
    collected_data: {},
    heat_level: "cold"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [viewingStory, setViewingStory] = useState<StoryViewerData | null>(null);
  const [welcomeCreated, setWelcomeCreated] = useState(false);
  const [sessionId] = useState(() => getOrCreateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get visitorId from URL param (widget) or generate locally
  const [visitorId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('vid') || getOrCreateVisitorId();
  });

  const { data: profile, isLoading: profileLoading } = usePublicProfile(undefined, userId);
  const { data: categories } = useCategories();
  const { data: carouselStories, isLoading: carouselLoading } = useCarouselStories(profile?.id);

  const extendedProfile = profile as typeof profile & {
    show_category_chips?: boolean;
    show_story_carousel?: boolean;
    luma_initial_message?: string;
    luma_avatar_url?: string;
    luma_status?: string;
  };

  const suggestions = useMemo(() => {
    if (!categories) return [];
    return categories.slice(0, 4).map(cat => cat.name);
  }, [categories]);

  // Welcome message
  useEffect(() => {
    if (profile && !carouselLoading && !welcomeCreated) {
      const customMessage = extendedProfile?.luma_initial_message || 
        `Olá! Prazer, sou a Luma ✨ Assessora do ${profile.business_name}. Como você se chama?`;

      const welcomeMessage: Message = {
        id: "welcome",
        content: customMessage,
        variant: "assistant",
        showSuggestions: false,
        showCarousel: false,
      };
      setMessages([welcomeMessage]);
      // Add welcome message to conversation history so AI knows it already greeted
      setConversationHistory([{ role: "assistant", content: customMessage }]);
      setWelcomeCreated(true);
      sendToParent('ready');
    }
  }, [profile, carouselLoading, carouselStories, welcomeCreated, extendedProfile?.luma_initial_message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!profile || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content,
      variant: "user",
    };

    // Build updated history LOCALLY to avoid async setState issue
    const updatedHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: "user", content }
    ];

    setMessages(prev => [...prev, newUserMessage]);
    setConversationHistory(updatedHistory);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-luma", {
        body: {
          message: content,
          profileId: profile.id,
          sessionId,
          browserFingerprint: visitorId,
          source: 'site',
          conversationHistory: updatedHistory,
          previousState: conversationState,
        },
      });

      if (error) throw error;

      if (data.conversation_state) {
        setConversationState(data.conversation_state);
      }

      const messagesArray: string[] = data.messages || [data.message];
      
      for (let i = 0; i < messagesArray.length; i++) {
        const isLastMessage = i === messagesArray.length - 1;
        
        setIsTyping(false);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const aiMessage: Message = {
          id: (Date.now() + i).toString(),
          content: messagesArray[i],
          variant: "assistant",
        };

        setMessages(prev => [...prev, aiMessage]);
        
        if (!isLastMessage) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
        }
      }
      
      setConversationHistory(prev => [...prev, { role: "assistant", content: messagesArray.join(" ") }]);

      if (data.show_story_id && data.current_story && data.current_chapters?.length > 0) {
        setTimeout(() => {
          setViewingStory({
            id: data.current_story.id,
            title: data.current_story.title,
            chapters: data.current_chapters,
            category_id: data.current_story.category_id,
          });
        }, 500);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, tive um problema técnico. Pode tentar novamente? 🙏",
        variant: "assistant",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleStoryClick = async (storyId: string) => {
    const { data: story } = await supabase
      .from("stories")
      .select("title, category_id, story_chapters(*)")
      .eq("id", storyId)
      .single();

    if (story && story.story_chapters.length > 0) {
      setViewingStory({
        id: storyId,
        title: story.title,
        chapters: story.story_chapters,
        category_id: story.category_id,
      });
    }
  };

  const handleRequestQuote = () => {
    setViewingStory(null);
    handleSend("Gostei do trabalho! Quero saber mais sobre orçamento.");
  };

  const handleClose = () => {
    sendToParent('close');
  };

  const handleMinimize = () => {
    sendToParent('minimize');
  };

  if (profileLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background rounded-2xl">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center bg-background rounded-2xl p-4">
        <p className="text-muted-foreground text-sm text-center">Widget não configurado</p>
      </div>
    );
  }

  // Block Luma Chat for free plan users
  if (!hasLumaChatAccess(profile.plan)) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background rounded-2xl p-6">
        <div className="w-12 h-12 mb-3 rounded-full bg-muted flex items-center justify-center">
          <MessageSquareOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm text-center">
          Chat não disponível
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background rounded-2xl overflow-hidden shadow-2xl border border-border/50">
      {/* Header */}
      <EmbedChatHeader
        photographerName={profile.business_name}
        avatarUrl={extendedProfile?.luma_avatar_url || profile.avatar_url || undefined}
        status={extendedProfile?.luma_status || "Online"}
        onClose={handleClose}
        onMinimize={handleMinimize}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="space-y-2"
          >
            <MessageBubble variant={message.variant}>
              {message.content}
            </MessageBubble>

            {message.showCarousel && carouselStories && carouselStories.length > 0 && (
              <motion.div 
                className="ml-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <StoriesCarousel
                  stories={carouselStories}
                  onStoryClick={handleStoryClick}
                />
              </motion.div>
            )}

            {message.showSuggestions && !message.showCarousel && suggestions.length > 0 && (
              <motion.div 
                className="ml-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SuggestionChips
                  suggestions={suggestions}
                  onSelect={handleSend}
                />
              </motion.div>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <EmbedChatInput onSend={handleSend} disabled={isLoading} />

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory && profile && (
          <StoryViewer
            storyId={viewingStory.id}
            storyTitle={viewingStory.title}
            profileId={profile.id}
            chapters={viewingStory.chapters}
            onClose={() => setViewingStory(null)}
            onRequestQuote={handleRequestQuote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
