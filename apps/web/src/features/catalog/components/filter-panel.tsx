"use client";

import type { Category } from "@outfit-builder/contracts";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  FormField,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@outfit-builder/ui";
import { SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import type { FormEvent } from "react";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "shoes", label: "Shoes" },
  { value: "jacket", label: "Jacket" },
  { value: "bag", label: "Bag" },
  { value: "accessory", label: "Accessory" },
];

const ALL_VALUE = "all";

export interface FilterPanelProps {
  colors: string[];
  sizes: string[];
  styleTags: string[];
}

interface FilterFormProps extends FilterPanelProps {
  category: string;
  color: string;
  size: string;
  style: string;
  search: string;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

function FilterForm({
  colors,
  sizes,
  styleTags,
  category,
  color,
  size,
  style,
  search,
  minPrice,
  maxPrice,
  onCategoryChange,
  onColorChange,
  onSizeChange,
  onStyleChange,
  onSearchChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSubmit,
  onReset,
}: FilterFormProps) {
  const uid = useId();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormField label="Search">
        {(field) => (
          <Input
            {...field}
            type="search"
            placeholder="Search products"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        )}
      </FormField>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${uid}-category`}>Category</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger id={`${uid}-category`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-color`}>Color</Label>
          <Select value={color} onValueChange={onColorChange}>
            <SelectTrigger id={`${uid}-color`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All colors</SelectItem>
              {colors.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-size`}>Size</Label>
          <Select value={size} onValueChange={onSizeChange}>
            <SelectTrigger id={`${uid}-size`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All sizes</SelectItem>
              {sizes.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {styleTags.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-style`}>Style</Label>
          <Select value={style} onValueChange={onStyleChange}>
            <SelectTrigger id={`${uid}-style`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All styles</SelectItem>
              {styleTags.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Min price">
          {(field) => (
            <Input
              {...field}
              type="number"
              min={0}
              inputMode="numeric"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
            />
          )}
        </FormField>
        <FormField label="Max price">
          {(field) => (
            <Input
              {...field}
              type="number"
              min={0}
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
            />
          )}
        </FormField>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" className="flex-1">
          Apply filters
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </form>
  );
}

export function FilterPanel({ colors, sizes, styleTags }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") ?? ALL_VALUE);
  const [color, setColor] = useState(searchParams.get("color") ?? ALL_VALUE);
  const [size, setSize] = useState(searchParams.get("size") ?? ALL_VALUE);
  const [style, setStyle] = useState(searchParams.get("style") ?? ALL_VALUE);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  function applyFilters(current: {
    category: string;
    color: string;
    size: string;
    style: string;
    search: string;
    minPrice: string;
    maxPrice: string;
  }) {
    const next = new URLSearchParams();
    const values: Record<string, string> = {
      category: current.category === ALL_VALUE ? "" : current.category,
      color: current.color === ALL_VALUE ? "" : current.color,
      size: current.size === ALL_VALUE ? "" : current.size,
      style: current.style === ALL_VALUE ? "" : current.style,
      search: current.search,
      minPrice: current.minPrice,
      maxPrice: current.maxPrice,
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
    }

    router.push(next.size > 0 ? `${pathname}?${next.toString()}` : pathname);
    setMobileOpen(false);
  }

  function currentState(overrides: Partial<Record<"category" | "color" | "size" | "style", string>> = {}) {
    return { category, color, size, style, search, minPrice, maxPrice, ...overrides };
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    applyFilters(currentState({ category: value }));
  }

  function handleColorChange(value: string) {
    setColor(value);
    applyFilters(currentState({ color: value }));
  }

  function handleSizeChange(value: string) {
    setSize(value);
    applyFilters(currentState({ size: value }));
  }

  function handleStyleChange(value: string) {
    setStyle(value);
    applyFilters(currentState({ style: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(currentState());
  }

  function handleReset() {
    setCategory(ALL_VALUE);
    setColor(ALL_VALUE);
    setSize(ALL_VALUE);
    setStyle(ALL_VALUE);
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
    setMobileOpen(false);
  }

  const sharedProps = {
    colors,
    sizes,
    styleTags,
    category,
    color,
    size,
    style,
    search,
    minPrice,
    maxPrice,
    onCategoryChange: handleCategoryChange,
    onColorChange: handleColorChange,
    onSizeChange: handleSizeChange,
    onStyleChange: handleStyleChange,
    onSearchChange: setSearch,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
    onSubmit: handleSubmit,
    onReset: handleReset,
  };

  return (
    <>
      <div className="md:hidden">
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              <SlidersHorizontal className="size-5" aria-hidden="true" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent title="Filter products">
            <FilterForm {...sharedProps} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="hidden md:block">
        <FilterForm {...sharedProps} />
      </div>
    </>
  );
}
