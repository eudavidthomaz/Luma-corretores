import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CategoryGroup {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  order_index: number;
  created_at: string;
}

export interface Category {
  id: string;
  group_id: string;
  slug: string;
  name: string;
  color: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface CategoryWithGroup extends Category {
  group: CategoryGroup;
}

export interface CategoryGroupWithCategories extends CategoryGroup {
  categories: Category[];
}

export function useCategoryGroups() {
  return useQuery({
    queryKey: ["category-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("category_groups")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data as CategoryGroup[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour - categories rarely change
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*, group:category_groups(*)")
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;
      return data as CategoryWithGroup[];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useCategoryGroupsWithCategories() {
  return useQuery({
    queryKey: ["category-groups-with-categories"],
    queryFn: async () => {
      const { data: groups, error: groupsError } = await supabase
        .from("category_groups")
        .select("*")
        .order("order_index");

      if (groupsError) throw groupsError;

      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (categoriesError) throw categoriesError;

      // Combine groups with their categories
      const groupsWithCategories = (groups as CategoryGroup[]).map((group) => ({
        ...group,
        categories: (categories as Category[]).filter(
          (cat) => cat.group_id === group.id
        ),
      }));

      return groupsWithCategories as CategoryGroupWithCategories[];
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Helper to get category by slug
export function useCategoryBySlug(slug: string | null) {
  const { data: categories } = useCategories();
  return categories?.find((cat) => cat.slug === slug) || null;
}

// Helper to get category by ID
export function useCategoryById(id: string | null) {
  const { data: categories } = useCategories();
  return categories?.find((cat) => cat.id === id) || null;
}

// Map old enum values to new category slugs
export const legacyCategoryMapping: Record<string, string> = {
  casamento: "casamento",
  newborn: "newborn",
  familia: "familia-lifestyle",
  corporativo: "retrato-corporativo",
  moda: "moda-editorial",
  gastronomia: "gastronomia",
  gestante: "gestante",
  evento: "aniversario-adulto",
  preweeding: "pre-wedding",
};
