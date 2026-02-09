import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { StoriesCarousel } from "@/components/chat/StoriesCarousel";
import { StoryViewer } from "@/components/story/StoryViewer";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { motion, AnimatePresence } from "framer-motion";
import { usePublicProfile } from "@/hooks/usePublicData";
import { useCarouselStories } from "@/hooks/useCarouselStories";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { Loader2, MessageSquareOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hasLumaChatAccess } from "@/lib/planLimits";
import { Button } from "@/components/ui/button";

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
  heatLevel?: "cold" | "warm" | "hot";
  phase?: string;
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

export default function ChatPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { user, profile: authProfile, isLoading: authLoading } = useAuth();
  
  const effectiveSlug = slug || undefined;
  const effectiveUserId = !slug && user ? user.id : undefined;
  
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
  const [visitorId] = useState(() => getOrCreateVisitorId());
  const [sessionId] = useState(() => getOrCreateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: profile, isLoading: profileLoading } = usePublicProfile(effectiveSlug, effectiveUserId);
  const { data: categories } = useCategories();
  const { data: carouselStories, isLoading: carouselLoading } = useCarouselStories(profile?.id);

  const extendedProfile = profile as typeof profile & {
    show_category_chips?: boolean;
    show_story_carousel?: boolean;
    luma_initial_message?: string;
    luma_avatar_url?: string;
    luma_status?: string;
  };

  // Generate suggestions from dynamic categories
  const suggestions = useMemo(() => {
    if (!categories) return [];
    // Get first 4 category names
    return categories.slice(0, 4).map(cat => cat.name);
  }, [categories]);
  
  const showCategoryChips = extendedProfile?.show_category_chips !== false;
  const showStoryCarousel = extendedProfile?.show_story_carousel !== false;

  // Initialize welcome message
  useEffect(() => {
    const dataReady = profile && !carouselLoading && !welcomeCreated;
    
    if (dataReady) {
      // Use custom message if set, otherwise ask for name first
      const customMessage = extendedProfile?.luma_initial_message || 
        `Olá! Prazer, sou a Luma ✨ Assessora do ${profile.business_name}. Como você se chama?`;

      const carouselHasStories = carouselStories && carouselStories.length > 0;

      const welcomeMessage: Message = {
        id: "welcome",
        content: customMessage,
        variant: "assistant",
        // Don't show suggestions/carousel on first message - focus on getting name
        showSuggestions: false,
        showCarousel: false,
      };
      setMessages([welcomeMessage]);
      // Add welcome message to conversation history so AI knows it already greeted
      setConversationHistory([{ role: "assistant", content: customMessage }]);
      setWelcomeCreated(true);
    }
  }, [profile, carouselLoading, carouselStories, welcomeCreated, extendedProfile?.luma_initial_message]);

  // Scroll to bottom on new messages
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

      // Update conversation state from response
      if (data.conversation_state) {
        setConversationState(data.conversation_state);
      }

      // Get messages array
      const messagesArray: string[] = data.messages || [data.message];
      
      // Add each message with a delay to simulate typing
      for (let i = 0; i < messagesArray.length; i++) {
        const isLastMessage = i === messagesArray.length - 1;
        
        setIsTyping(false);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const aiMessage: Message = {
          id: (Date.now() + i).toString(),
          content: messagesArray[i],
          variant: "assistant",
          heatLevel: data.heat_level || data.conversation_state?.heat_level || "cold",
          phase: data.phase || data.conversation_state?.phase || "abertura",
        };

        setMessages(prev => [...prev, aiMessage]);
        
        if (!isLastMessage) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
        }
      }
      
      setConversationHistory(prev => [...prev, { role: "assistant", content: messagesArray.join(" ") }]);

      // AUTO-OPEN STORY if AI returned show_story_id
      if (data.show_story_id && data.current_story && data.current_chapters?.length > 0) {
        // Small delay so user sees the message first
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

  if (!slug && !authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Estúdio não encontrado</h1>
          <p className="text-muted-foreground">Este link parece estar incorreto.</p>
        </div>
      </div>
    );
  }

  // Block Luma Chat for free plan users
  if (!hasLumaChatAccess(profile.plan)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MessageSquareOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Chat não disponível</h1>
          <p className="text-muted-foreground mb-6">
            Este estúdio ainda não ativou o assistente virtual Luma.
          </p>
          {profile.slug && (
            <Button asChild variant="outline">
              <Link to={`/p/${profile.slug}`}>
                Ver Mini-Site do Estúdio
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden overscroll-contain">
      {/* Ambient background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <ChatHeader
        photographerName={profile.business_name}
        specialty={profile.niche || "Fotografia"}
        avatarUrl={extendedProfile?.luma_avatar_url || profile.avatar_url || undefined}
        status={extendedProfile?.luma_status || "Online"}
        slug={profile.slug || undefined}
        plan={profile.plan}
      />

      {/* Chat messages - flex-1 with overflow */}
      <main className="flex-1 overflow-y-auto pt-24 pb-32 px-4 max-w-2xl mx-auto w-full scrollbar-thin overscroll-contain">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-3"
            >
              <MessageBubble variant={message.variant}>
                {message.content}
              </MessageBubble>

              {/* Story Carousel - only if explicitly set */}
              {message.showCarousel && carouselStories && carouselStories.length > 0 && (
                <motion.div 
                  className="ml-11"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <StoriesCarousel
                    stories={carouselStories}
                    onStoryClick={handleStoryClick}
                  />
                </motion.div>
              )}

              {/* Category Chips - only if explicitly set */}
              {message.showSuggestions && !message.showCarousel && suggestions.length > 0 && (
                <motion.div 
                  className="ml-11"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
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
                exit={{ opacity: 0, y: -10 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput onSend={handleSend} disabled={isLoading} />

      {/* Story Viewer Modal */}
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
