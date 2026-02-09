import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      {/* Ambient background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-8xl font-bold gradient-text mb-4"
        >
          404
        </motion.div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Parece que você se perdeu. Que tal voltar para o início?
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="gradient" asChild>
            <Link to="/chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Ir para o Chat
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin" className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
