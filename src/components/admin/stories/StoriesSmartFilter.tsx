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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StoriesFilters } from "@/hooks/useFilteredStories";
import { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

interface StoriesSmartFilterProps {
  filters: StoriesFilters;
  onFiltersChange: (filters: StoriesFilters) => void;
  totalResults: number;
  categories?: Category[];
}

export function StoriesSmartFilter({
  filters,
  onFiltersChange,
  totalResults,
  categories,
}: StoriesSmartFilterProps) {
  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.sort !== "newest";

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      category: "all",
      sort: "newest",
    });
  };

  const updateFilter = <K extends keyof StoriesFilters>(
    key: K,
    value: StoriesFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const FilterControls = () => (
    <div className="space-y-4">
      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Status</label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            updateFilter("status", value as StoriesFilters["status"])
          }
        >
          <SelectTrigger className="glass border-luma-glass-border">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicadas</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      {categories && categories.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Categoria
          </label>
          <Select
            value={filters.category}
            onValueChange={(value) => updateFilter("category", value)}
          >
            <SelectTrigger className="glass border-luma-glass-border">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Ordenar por
        </label>
        <Select
          value={filters.sort}
          onValueChange={(value) =>
            updateFilter("sort", value as StoriesFilters["sort"])
          }
        >
          <SelectTrigger className="glass border-luma-glass-border">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigas</SelectItem>
            <SelectItem value="views">Mais visualizadas</SelectItem>
            <SelectItem value="name">Nome A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass rounded-2xl p-4 border border-luma-glass-border"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar histórias..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 glass border-luma-glass-border"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden sm:flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) =>
              updateFilter("status", value as StoriesFilters["status"])
            }
          >
            <SelectTrigger className="w-[130px] glass border-luma-glass-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="published">Publicadas</SelectItem>
              <SelectItem value="draft">Rascunhos</SelectItem>
            </SelectContent>
          </Select>

          {categories && categories.length > 0 && (
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter("category", value)}
            >
              <SelectTrigger className="w-[150px] glass border-luma-glass-border">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={filters.sort}
            onValueChange={(value) =>
              updateFilter("sort", value as StoriesFilters["sort"])
            }
          >
            <SelectTrigger className="w-[150px] glass border-luma-glass-border">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigas</SelectItem>
              <SelectItem value="views">Mais visualizadas</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filters */}
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="glass border-luma-glass-border">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FilterControls />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Results count and clear */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-luma-glass-border/50">
        <span className="text-sm text-muted-foreground">
          {totalResults} história{totalResults !== 1 ? "s" : ""} encontrada
          {totalResults !== 1 ? "s" : ""}
        </span>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>
    </motion.div>
  );
}
