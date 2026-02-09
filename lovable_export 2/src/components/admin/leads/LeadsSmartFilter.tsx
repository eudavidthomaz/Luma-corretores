import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, Flame, Sun, Snowflake, Filter } from "lucide-react";
import { LeadFilters, defaultLeadFilters } from "@/hooks/useFilteredLeads";
import { leadStatusLabels } from "@/hooks/useLeads";
import { cn } from "@/lib/utils";
import { HeatBreakdown } from "@/hooks/useHeatBreakdown";
import { LucideIcon } from "lucide-react";

interface LeadsSmartFilterProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  heatBreakdown: HeatBreakdown;
  categoryGroups?: Array<{
    id: string;
    name: string;
    icon: string | null;
    categories: Array<{ id: string; name: string; color: string | null }>;
  }>;
}

interface HeatOptionProps {
  id: "all" | "hot" | "warm" | "cold";
  label: string;
  count: number;
  icon?: LucideIcon;
  color?: "orange" | "yellow" | "blue";
  isActive: boolean;
  onClick: () => void;
}

function HeatOption({ id, label, count, icon: Icon, color, isActive, onClick }: HeatOptionProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-xl transition-all border",
        isActive
          ? cn(
              color === "orange" && "bg-orange-500/20 border-orange-500/50",
              color === "yellow" && "bg-yellow-500/20 border-yellow-500/50",
              color === "blue" && "bg-blue-500/20 border-blue-500/50",
              !color && "bg-primary/20 border-primary/50"
            )
          : "bg-card/30 border-white/5 hover:bg-card/50"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5",
            isActive
              ? cn(
                  color === "orange" && "text-orange-400",
                  color === "yellow" && "text-yellow-400",
                  color === "blue" && "text-blue-400"
                )
              : "text-muted-foreground"
          )}
        />
      )}
      <span
        className={cn(
          "text-lg font-bold",
          isActive
            ? cn(
                color === "orange" && "text-orange-400",
                color === "yellow" && "text-yellow-400",
                color === "blue" && "text-blue-400",
                !color && "text-primary"
              )
            : "text-foreground"
        )}
      >
        {count}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </motion.button>
  );
}

interface ChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  color?: string | null;
}

function FilterChip({ label, isActive, onClick, color }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm transition-all border flex items-center gap-1.5",
        isActive
          ? "bg-primary/20 border-primary/50 text-primary"
          : "bg-card/30 border-white/5 hover:bg-card/50 text-muted-foreground"
      )}
    >
      {color && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  );
}

export function LeadsSmartFilter({
  filters,
  onFiltersChange,
  heatBreakdown,
  categoryGroups,
}: LeadsSmartFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const allCategories = useMemo(
    () => categoryGroups?.flatMap((g) => g.categories) || [],
    [categoryGroups]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.heat !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.category !== "all") count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    onFiltersChange(defaultLeadFilters);
  };

  const handleHeatChange = (heat: "all" | "hot" | "warm" | "cold") => {
    onFiltersChange({ ...filters, heat });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  return (
    <>
      {/* Collapsed State - Compact Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 glass border-luma-glass-border"
          />
        </div>

        {/* Filter Button with Badge */}
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className={cn(
            "gap-2 glass border-luma-glass-border",
            activeFilterCount > 0 && "border-primary/50 bg-primary/10"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          <AnimatePresence mode="wait">
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 justify-center rounded-full bg-primary text-primary-foreground"
                >
                  {activeFilterCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Clear Button */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button variant="ghost" size="icon" onClick={clearFilters} className="h-9 w-9">
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expanded State - Bottom Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="glass border-luma-glass-border rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          <SheetHeader className="text-left pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </SheetTitle>
            <SheetDescription>Refine sua busca de leads</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-4 overflow-y-auto flex-1">
            {/* Temperature Section */}
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Temperatura
              </label>
              <div className="grid grid-cols-4 gap-2">
                <HeatOption
                  id="all"
                  label="Todos"
                  count={heatBreakdown.total}
                  isActive={filters.heat === "all"}
                  onClick={() => handleHeatChange("all")}
                />
                <HeatOption
                  id="hot"
                  label="Quentes"
                  count={heatBreakdown.hot}
                  icon={Flame}
                  color="orange"
                  isActive={filters.heat === "hot"}
                  onClick={() => handleHeatChange("hot")}
                />
                <HeatOption
                  id="warm"
                  label="Mornos"
                  count={heatBreakdown.warm}
                  icon={Sun}
                  color="yellow"
                  isActive={filters.heat === "warm"}
                  onClick={() => handleHeatChange("warm")}
                />
                <HeatOption
                  id="cold"
                  label="Frios"
                  count={heatBreakdown.cold}
                  icon={Snowflake}
                  color="blue"
                  isActive={filters.heat === "cold"}
                  onClick={() => handleHeatChange("cold")}
                />
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="Todos"
                  isActive={filters.status === "all"}
                  onClick={() => handleStatusChange("all")}
                />
                {Object.entries(leadStatusLabels).map(([value, label]) => (
                  <FilterChip
                    key={value}
                    label={label}
                    isActive={filters.status === value}
                    onClick={() => handleStatusChange(value)}
                  />
                ))}
              </div>
            </div>

            {/* Interest/Category Section */}
            {allCategories.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Interesse
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Todos"
                    isActive={filters.category === "all"}
                    onClick={() => handleCategoryChange("all")}
                  />
                  {allCategories.map((cat) => (
                    <FilterChip
                      key={cat.id}
                      label={cat.name}
                      color={cat.color}
                      isActive={filters.category === cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          <SheetFooter className="flex-row gap-3 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button onClick={() => setIsOpen(false)} className="flex-1">
              Aplicar {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
