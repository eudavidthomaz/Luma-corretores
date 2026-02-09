import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCategoryGroupsWithCategories, Category } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

interface CategorySelectorProps {
  value: string | null;
  onChange: (categoryId: string) => void;
  label?: string;
  required?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  label = "Categoria",
  required = false,
}: CategorySelectorProps) {
  const { data: groups, isLoading } = useCategoryGroupsWithCategories();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Find the group that contains the selected category
  useEffect(() => {
    if (value && groups) {
      for (const group of groups) {
        const found = group.categories.find((cat) => cat.id === value);
        if (found) {
          setSelectedGroupId(group.id);
          break;
        }
      }
    }
  }, [value, groups]);

  const selectedGroup = groups?.find((g) => g.id === selectedGroupId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Group Selector */}
      <div className="space-y-2">
        <Label>
          Grupo {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={selectedGroupId || ""}
          onValueChange={(groupId) => {
            setSelectedGroupId(groupId);
            // Reset category when group changes
            onChange("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o grupo..." />
          </SelectTrigger>
          <SelectContent>
            {groups?.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                <span className="flex items-center gap-2">
                  <span>{group.icon}</span>
                  <span>{group.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Selector (only visible when group is selected) */}
      {selectedGroupId && selectedGroup && (
        <div className="space-y-2">
          <Label>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria..." />
            </SelectTrigger>
            <SelectContent>
              {selectedGroup.categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// Compact version for filters
interface CategoryFilterProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  showAllOption?: boolean;
}

export function CategoryFilter({
  value,
  onChange,
  showAllOption = true,
}: CategoryFilterProps) {
  const { data: groups, isLoading } = useCategoryGroupsWithCategories();

  if (isLoading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  // Flatten all categories for the filter
  const allCategories: (Category & { groupName: string; groupIcon: string })[] = [];
  groups?.forEach((group) => {
    group.categories.forEach((cat) => {
      allCategories.push({
        ...cat,
        groupName: group.name,
        groupIcon: group.icon || "",
      });
    });
  });

  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => onChange(val === "all" ? null : val)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filtrar por categoria" />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && <SelectItem value="all">Todas as categorias</SelectItem>}
        {groups?.map((group) => (
          <div key={group.id}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
              {group.icon} {group.name}
            </div>
            {group.categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="pl-6">
                {category.name}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
