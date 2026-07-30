"use client";

import { Badge, Button, cn, Dialog, DialogContent, DialogTrigger, FormField, showToast } from "@outfit-builder/ui";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import type { OutfitStoreItem } from "@/features/outfit-builder/store/outfit-store";

import { startTryOn } from "../api/start-try-on";
import { useTryOnPolling } from "../hooks/use-try-on-polling";

export interface TryOnDialogProps {
  items: OutfitStoreItem[];
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // stays comfortably under the API's 8mb base64 body limit
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected photo"));
    reader.readAsDataURL(file);
  });
}

export function TryOnDialog({ items }: TryOnDialogProps) {
  const [open, setOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | undefined>(undefined);
  const [tryOnId, setTryOnId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { result, error: pollError } = useTryOnPolling(tryOnId);
  const isProcessing = tryOnId !== null && (!result || result.status === "processing");
  const isInputDisabled = isStarting || isProcessing;

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function reset() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setFileError(undefined);
    setStartError(undefined);
    setTryOnId(null);
  }

  // Shared by the file input's onChange and the dropzone's onDrop — the
  // dropzone is a progressive-enhancement addition on top of the input,
  // not a replacement for it (the input stays in the DOM, keyboard/screen
  // reader accessible).
  function processFile(file: File | undefined | null) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Use a JPEG, PNG or WebP photo");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFileError("Photo must be under 5MB");
      return;
    }

    setFileError(undefined);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setPhotoFile(file);
    setPhotoPreviewUrl(previewUrl);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    processFile(event.target.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (isInputDisabled) return;
    setIsDraggingOver(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    if (isInputDisabled) return;
    processFile(event.dataTransfer.files?.[0]);
  }

  async function handleTryOn() {
    if (!photoFile) {
      setFileError("Choose a photo first");
      return;
    }

    setIsStarting(true);
    setStartError(undefined);

    try {
      const photo = await readFileAsDataUrl(photoFile);
      const response = await startTryOn({
        photo,
        items: items.map((entry) => ({ productId: entry.product.id, category: entry.product.category })),
      });
      setTryOnId(response.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start virtual try-on";
      setStartError(message);
      showToast({ title: "Could not start try-on", description: message, variant: "error" });
    } finally {
      setIsStarting(false);
    }
  }

  // fileError is intentionally excluded — FormField already renders it
  // next to the file input, so including it here would show it twice.
  const displayError = startError ?? pollError ?? (result?.status === "failed" ? result.error : null);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={items.length === 0}>
          Try it on
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Try it on"
        description="Upload a photo of yourself to see this outfit on you. Real, unbranded stock/AI-generated composite — not a real garment fitting."
      >
        <div className="flex flex-col gap-4">
          {!result?.resultImageUrl && (
            <FormField label="Your photo" hint="JPEG, PNG or WebP, under 5MB" error={fileError}>
              {(field) => (
                <div
                  onDragEnter={handleDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isInputDisabled && fileInputRef.current?.click()}
                  className={cn(
                    "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed px-4 py-8 text-center transition-colors duration-200",
                    isDraggingOver ? "border-primary bg-primary/5" : "border-border-strong",
                    isInputDisabled && "pointer-events-none opacity-50",
                  )}
                >
                  <p className="text-base text-foreground">
                    {photoFile ? photoFile.name : "Drag and drop a photo, or click to browse"}
                  </p>
                  <input
                    {...field}
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleFileChange}
                    disabled={isInputDisabled}
                    className="sr-only"
                  />
                </div>
              )}
            </FormField>
          )}

          {photoPreviewUrl && !result?.resultImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, next/image can't optimize object URLs
            <img
              src={photoPreviewUrl}
              alt="Your uploaded photo"
              className="aspect-4/5 w-full max-w-40 rounded-md object-cover"
            />
          )}

          {isProcessing && (
            <div className="flex items-center gap-3" role="status" aria-live="polite">
              <Badge variant="info">
                Trying on {result?.step ?? 1} of {result?.totalSteps ?? items.length}
              </Badge>
              <p className="text-base text-muted-foreground">This can take a minute or two…</p>
            </div>
          )}

          {result?.resultImageUrl && (
            <div className="flex flex-col gap-3">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-md bg-background">
                <Image src={result.resultImageUrl} alt="You wearing this outfit" fill className="object-cover" />
              </div>
              <Button variant="ghost" onClick={reset}>
                Try a different photo
              </Button>
            </div>
          )}

          {displayError && (
            <p className="text-base text-error" role="alert">
              {displayError}
            </p>
          )}

          {!result?.resultImageUrl && (
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleTryOn}
                disabled={!photoFile || isProcessing}
                loading={isStarting}
                loadingText="Starting…"
              >
                Try it on
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
