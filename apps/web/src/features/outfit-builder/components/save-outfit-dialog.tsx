"use client";

import { Button, Dialog, DialogContent, DialogTrigger, FormField, Input, showToast } from "@outfit-builder/ui";
import { useState } from "react";
import type { FormEvent } from "react";

import { saveOutfit } from "../api/save-outfit";
import { useOutfitStore, type OutfitStoreItem } from "../store/outfit-store";

export interface SaveOutfitDialogProps {
  items: OutfitStoreItem[];
}

export function SaveOutfitDialog({ items }: SaveOutfitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const clear = useOutfitStore((state) => state.clear);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Give your outfit a name");
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      await saveOutfit({
        name: trimmedName,
        items: items.map((entry) => ({
          productId: entry.product.id,
          category: entry.product.category,
          selectedColor: entry.selectedColor,
          selectedSize: entry.selectedSize,
        })),
      });
      showToast({
        title: "Outfit saved",
        description: `"${trimmedName}" was added to your saved outfits.`,
        variant: "success",
      });
      setOpen(false);
      setName("");
      clear();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save outfit";
      setError(message);
      showToast({ title: "Could not save outfit", description: message, variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary" disabled={items.length === 0}>
          Save outfit
        </Button>
      </DialogTrigger>
      <DialogContent title="Save this outfit" description="Give your outfit a name so you can find it later.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Outfit name" required error={error}>
            {(field) => (
              <Input
                {...field}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Weekend brunch"
                autoFocus
                required
              />
            )}
          </FormField>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSaving} loadingText="Saving...">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
