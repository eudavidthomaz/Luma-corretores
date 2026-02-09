import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Mail, Lock, Building2, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import ligaLogoWhite from "@/assets/liga-logo-white.png";
import lumaLogoWhite from "@/assets/luma-logo-white.png";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signUpSchema = loginSchema.extend({
  businessName: z.string().min(2, "Nome do estúdio deve ter no mínimo 2 caracteres"),
});

// Plans that grant access to the system
const PAID_PLANS = ['lite', 'pro', 'ultra', 'enterprise'];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  
  const { signIn, signUp, user, profile, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Check for existing session on mount (OAuth callback)
  useEffect(() => {
    const checkAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsProcessingAuth(true);
      }
    };
    checkAuthState();
  }, []);

  // Redirect authenticated users based on their plan
  useEffect(() => {
    if (!isAuthLoading && user && profile) {
      const hasPaidPlan = PAID_PLANS.includes(profile.plan);
      
      if (hasPaidPlan) {
        navigate('/admin');
      } else {
        // User needs to subscribe first
        navigate('/admin/subscription');
      }
    }
  }, [user, profile, isAuthLoading, navigate]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
        scopes: 'https://www.googleapis.com/auth/calendar.events.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      toast({
        title: "Erro ao entrar com Google",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    setIsLoading(true);
    try {
      const { error, redirected } = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: `${window.location.origin}/auth`,
      });
      
      if (error) {
        toast({
          title: "Erro ao entrar com Apple",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // If redirected, the page will reload with tokens
      if (redirected) {
        return;
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Show processing state while OAuth callback is being handled
  if (isProcessingAuth || (isAuthLoading && user)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-area-inset">
        <div className="fixed inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl aurora-orb"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 z-10"
        >
          <img 
            src={lumaLogoWhite} 
            alt="Luma" 
            className="h-16 sm:h-20 w-auto"
          />
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Processando login...</span>
          </div>
          <p className="text-sm text-muted-foreground/70">
            Estamos verificando sua conta
          </p>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          toast({
            title: "Erro de validação",
            description: result.error.errors[0].message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro ao entrar",
            description: error.message === "Invalid login credentials" 
              ? "Email ou senha incorretos" 
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "Bem-vindo de volta!" });
          navigate("/admin");
        }
      } else {
        const result = signUpSchema.safeParse({ email, password, businessName });
        if (!result.success) {
          toast({
            title: "Erro de validação",
            description: result.error.errors[0].message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, businessName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Email já cadastrado",
              description: "Tente fazer login ou use outro email.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro ao criar conta",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({ title: "Conta criada com sucesso!" });
          navigate("/admin");
        }
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Animated ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl aurora-orb"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/5 rounded-full blur-3xl aurora-orb"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.6, 0.5]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo - Luma by Liga da Fotografia with stagger */}
          <motion.div 
            className="flex flex-col items-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          >
            <img 
              src={lumaLogoWhite} 
              alt="Luma" 
              className="h-16 sm:h-20 w-auto mb-4 sm:mb-6"
            />
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-sm text-muted-foreground">by</span>
              <img 
                src={ligaLogoWhite} 
                alt="Liga da Fotografia" 
                className="h-8 sm:h-10 w-auto opacity-70"
              />
            </div>
          </motion.div>

          {/* Headline with stagger */}
          <motion.p 
            className="text-center text-lg sm:text-xl text-foreground/80 mb-6 sm:mb-8 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          >
            Onde o artista vira empresa.
          </motion.p>

          {/* Card with stagger */}
          <motion.div 
            className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-luma-glass-border"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          >
            <div className="text-center mb-5 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isLogin ? "Entrar na sua conta" : "Criar nova conta"}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mt-2">
                {isLogin 
                  ? "Acesse seu painel de controle" 
                  : "Comece a encantar seus clientes"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Animated business name field */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="businessName"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-sm">Nome do Estúdio</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="Studio Criativo"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="pl-10 h-12 touch-target"
                          autoComplete="organization"
                          enterKeyHint="next"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 touch-target"
                    inputMode="email"
                    autoComplete="email"
                    enterKeyHint="next"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 touch-target"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    enterKeyHint="go"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full gap-2 touch-target"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aguarde...
                  </>
                ) : (
                  <>
                    {isLogin ? "Entrar" : "Criar conta"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-luma-glass-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">
                  ou continue com
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full gap-3 touch-target"
                onClick={signInWithGoogle}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Entrar com Google
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full gap-3 touch-target"
                onClick={signInWithApple}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Entrar com Apple
              </Button>
            </div>

            <div className="mt-5 sm:mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-primary after:transition-all after:duration-300 hover:after:w-full touch-target"
              >
                {isLogin
                  ? "Não tem conta? Criar agora"
                  : "Já tem conta? Fazer login"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 sm:py-6 text-center px-4">
        <p className="text-xs text-muted-foreground">
          Tecnologia proprietária Liga da Fotografia. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
