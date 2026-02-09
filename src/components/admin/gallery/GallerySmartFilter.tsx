import { motion } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GalleryFilters, defaultGalleryFilters } from "@/hooks/useFilteredGalleries";
import { cn } from "@/lib/utils";

interface GallerySmartFilterProps {
  filters: GalleryFilters;
  onFiltersChange: (filters: GalleryFilters) => void;
  totalResults: number;
  totalGalleries: number;
}

const statusOptions = [
  { value: "all", label: "Todos os Status" },
  { value: "draft", label: "Rascunho" },
  { value: "active", label: "Ativas" },
  { value: "expiring", label: "Expirando" },
  { value: "expired", label: "Expiradas" },
];

const sortOptions = [
  { value: "newest", label: "Mais Recentes" },
  { value: "oldest", label: "Mais Antigas" },
  { value: "expiring", label: "Expirando Primeiro" },
  { value: "name", label: "Nome A-Z" },
];

export function GallerySmartFilter({
  filters,
  onFiltersChange,
  totalResults,
  totalGalleries,
}: GallerySmartFilterProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.sort !== "newest";

  const activeFilterCount = [
    filters.search !== "",
    filters.status !== "all",
    filters.sort !== "newest",
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange(defaultGalleryFilters);
  };

  const isFiltered = totalResults !== totalGalleries;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass rounded-2xl p-4 border border-luma-glass-border space-y-3"
    >
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar galerias..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-10 bg-card/30 border-white/10"
          />
        </div>

        {/* Status Select */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value as GalleryFilters["status"],
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-card/30 border-white/10">
            <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select
          value={filters.sort}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              sort: value as GalleryFilters["sort"],
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-card/30 border-white/10">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Info Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isFiltered ? (
              <>
                Mostrando{" "}
                <span className="font-medium text-foreground">{totalResults}</span> de{" "}
                <span className="font-medium text-foreground">{totalGalleries}</span>{" "}
                galerias
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{totalGalleries}</span>{" "}
                {totalGalleries === 1 ? "galeria" : "galerias"}
              </>
            )}
          </span>

          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-xs bg-primary/10 text-primary border-primary/20"
            >
              {activeFilterCount} {activeFilterCount === 1 ? "filtro" : "filtros"}
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>
    </motion.div>
  );
}
