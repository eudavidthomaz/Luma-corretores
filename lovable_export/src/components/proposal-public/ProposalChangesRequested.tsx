import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export function ProposalChangesRequested() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30"
    >
      <div className="flex items-start gap-3">
        <MessageSquare className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-700">Alteração Solicitada</h3>
          <p className="text-sm text-yellow-600/80 mt-1">
            Sua solicitação de alteração foi enviada ao fotógrafo. 
            Você receberá uma nova proposta em breve.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
