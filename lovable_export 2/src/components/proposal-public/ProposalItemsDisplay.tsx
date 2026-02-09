import { motion } from "framer-motion";
import { Check, Gift, FileEdit, Film, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProposalItem {
  id: string;
  name?: string;
  description?: string;  // Mantido para compatibilidade
  details?: string;
  quantity: number;
  unit_price: number;
  show_price?: boolean;
  category?: string | null;
}

interface ProposalItemsDisplayProps {
  items: ProposalItem[];
  totalAmount: number;
  discountAmount: number;
  isVideoProposal?: boolean;
}

const CATEGORY_CONFIG = {
  pre_production: { 
    label: "Pré-Produção", 
    icon: FileEdit, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  production: { 
    label: "Produção", 
    icon: Film, 
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  post_production: { 
    label: "Pós-Produção", 
    icon: Palette, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
};

export function ProposalItemsDisplay({ items, totalAmount, discountAmount, isVideoProposal }: ProposalItemsDisplayProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate subtotal only from items with show_price=true
  const subtotal = items.reduce((sum, item) => {
    const showPrice = item.show_price !== false;
    if (showPrice) {
      return sum + ((item.quantity || 1) * (item.unit_price || 0));
    }
    return sum;
  }, 0);

  // Get display name (supports both old 'description' and new 'name' fields)
  const getItemName = (item: ProposalItem) => item.name || item.description || "Item";
  
  // Group items by category for video proposals
  const groupedItems = isVideoProposal ? groupItemsByCategory(items) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-editorial-display text-gallery-text mb-1 sm:mb-2">
          O que está incluso
        </h2>
        <p className="text-sm sm:text-base text-gallery-text-muted">
          Confira os detalhes da proposta
        </p>
      </motion.div>
      
      {/* Grouped Display for Video Proposals */}
      {isVideoProposal && groupedItems ? (
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedItems).map(([category, categoryItems], groupIndex) => {
            if (categoryItems.length === 0) return null;
            const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
            const Icon = config?.icon || Check;
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + groupIndex * 0.1 }}
                className="space-y-3"
              >
                {/* Category Header */}
                {category !== 'uncategorized' && config && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${config.color}`} />
                    </div>
                    <h3 className={`text-base sm:text-lg font-semibold ${config.color}`}>
                      {config.label}
                    </h3>
                  </div>
                )}
                
                {/* Items in category */}
                <div className="space-y-2 sm:space-y-3">
                  {categoryItems.map((item, index) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      index={index}
                      formatCurrency={formatCurrency}
                      getItemName={getItemName}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Standard Display for Photo Proposals */
        <div className="space-y-2 sm:space-y-3">
          {items.map((item, index) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              index={index}
              formatCurrency={formatCurrency}
              getItemName={getItemName}
            />
          ))}
        </div>
      )}
      
      {/* Summary Card - Sticky on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="gallery-glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8"
      >
        <div className="space-y-2 sm:space-y-3">
          {/* Only show subtotal if different from total or if there's a discount */}
          {(discountAmount > 0 || subtotal !== totalAmount) && (
            <div className="flex justify-between items-center text-sm text-gallery-text-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          )}
          
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-sm text-green-500">
              <span>Desconto</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          
          <div className="border-t border-gallery-border pt-2 sm:pt-3">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-medium text-gallery-text">Total</span>
              <span className="text-xl sm:text-2xl font-bold text-gallery-accent">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper function to group items by category
function groupItemsByCategory(items: ProposalItem[]) {
  const groups: Record<string, ProposalItem[]> = {
    pre_production: [],
    production: [],
    post_production: [],
    uncategorized: [],
  };
  
  items.forEach(item => {
    const category = item.category || 'uncategorized';
    if (groups[category]) {
      groups[category].push(item);
    } else {
      groups.uncategorized.push(item);
    }
  });
  
  return groups;
}

// Compact Item Card Component
function ItemCard({ 
  item, 
  index, 
  formatCurrency, 
  getItemName,
}: { 
  item: ProposalItem; 
  index: number;
  formatCurrency: (value: number) => string;
  getItemName: (item: ProposalItem) => string;
}) {
  const showPrice = item.show_price !== false;
  const itemTotal = (item.quantity || 1) * (item.unit_price || 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.03 }}
      className="gallery-glass-card rounded-xl p-3 sm:p-4"
    >
      <div className="flex items-center gap-3">
        {/* Compact icon */}
        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          showPrice 
            ? "bg-gallery-accent/10" 
            : "bg-green-500/10"
        }`}>
          {showPrice ? (
            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-gallery-accent" />
          ) : (
            <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          )}
        </div>
        
        {/* Content - truncated on mobile */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm sm:text-base text-gallery-text truncate">
            {getItemName(item)}
          </h3>
          {item.details && (
            <p className="text-xs sm:text-sm text-gallery-text-muted line-clamp-1 mt-0.5">
              {item.details}
            </p>
          )}
          {/* Quantity - compact display */}
          {(item.quantity || 1) > 1 && (
            <p className="text-xs text-gallery-text-muted mt-0.5">
              Qtd: {item.quantity}
            </p>
          )}
        </div>
        
        {/* Price - right aligned */}
        <div className="text-right flex-shrink-0 pl-2">
          {showPrice ? (
            <>
              <p className="font-semibold text-sm sm:text-base text-gallery-text whitespace-nowrap">
                {formatCurrency(itemTotal)}
              </p>
              {(item.quantity || 1) > 1 && (
                <p className="text-xs text-gallery-text-muted whitespace-nowrap">
                  {formatCurrency(item.unit_price || 0)} cada
                </p>
              )}
            </>
          ) : (
            <Badge 
              variant="secondary" 
              className="bg-green-500/20 text-green-600 border-green-500/30 text-xs"
            >
              INCLUSO
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
