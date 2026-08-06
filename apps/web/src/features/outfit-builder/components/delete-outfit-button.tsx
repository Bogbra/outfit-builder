"use client";

import { Button, Dialog, DialogContent, DialogTrigger, showToast } from "@outfit-builder/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteOutfit } from "../api/delete-outfit";

export interface DeleteOutfitButtonProps {
  id: string;
  name: string;
}

export function DeleteOutfitButton({ id, name }: DeleteOutfitButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteOutfit(id);
      showToast({ title: "Outfit deleted", description: `"${name}" was removed.`, variant: "success" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete outfit";
      showToast({ title: "Could not delete outfit", description: message, variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Delete</Button>
      </DialogTrigger>
      <DialogContent
        title="Delete outfit"
        description={`Are you sure you want to delete "${name}"? This cannot be undone.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting} loadingText="Deleting...">
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
