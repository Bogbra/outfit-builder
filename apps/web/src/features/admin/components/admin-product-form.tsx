"use client";

import {
  adminProductFormSchema,
  ALLOWED_IMAGE_HOSTS,
  availabilitySchema,
  isAllowedImageUrl,
  OPTIONAL_CATEGORIES,
  REQUIRED_CATEGORIES,
  type Availability,
  type Category,
} from "@outfit-builder/contracts";
import {
  Button,
  Checkbox,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  showToast,
  Textarea,
} from "@outfit-builder/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { createProduct } from "../api/create-product";
import type { AdminProduct } from "../api/get-admin-products";
import { updateProduct } from "../api/update-product";
import { CATEGORY_LABEL } from "@/features/outfit-builder/lib/category-labels";
import { AVAILABILITY_LABEL } from "@/lib/availability-labels";
import { parsePriceInputToMinor } from "@/lib/parse-price-input";

import { parseListInput } from "../lib/parse-list-input";
import { slugify } from "../lib/slugify";

const CATEGORY_OPTIONS: Category[] = [...REQUIRED_CATEGORIES, ...OPTIONAL_CATEGORIES];
const AVAILABILITY_OPTIONS = availabilitySchema.options;

export interface AdminProductFormProps {
  mode: "create" | "edit";
  product?: AdminProduct;
}

export function AdminProductForm({ mode, product }: AdminProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<Category>(product?.category ?? "top");
  // Displayed/edited as a major-unit decimal string ("89.00"); converted to
  // integer minor units (cents) on submit — see priceMinor in contracts.
  const [price, setPrice] = useState(product ? String(product.priceMinor / 100) : "");
  const [currency, setCurrency] = useState(product?.currency ?? "EUR");
  const [imagesText, setImagesText] = useState(product?.images.join("\n") ?? "");
  const [colorsText, setColorsText] = useState(product?.colors.join(", ") ?? "");
  const [sizesText, setSizesText] = useState(product?.sizes.join(", ") ?? "");
  const [styleTagsText, setStyleTagsText] = useState(product?.styleTags.join(", ") ?? "");
  const [material, setMaterial] = useState(product?.material ?? "");
  const [availability, setAvailability] = useState<Availability>(product?.availability ?? "in_stock");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageUrls = useMemo(() => parseListInput(imagesText, /\n/), [imagesText]);
  // Checked against the same host allowlist the server validates on
  // submit, so a disallowed URL never triggers a network request here
  // either — the preview would just fail to load anyway once submitted.
  const validImagePreviews = useMemo(() => imageUrls.filter(isAllowedImageUrl), [imageUrls]);
  const invalidImageUrls = useMemo(() => imageUrls.filter((url) => !isAllowedImageUrl(url)), [imageUrls]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const priceResult = parsePriceInputToMinor(price);

    const candidate = {
      name,
      slug,
      description,
      category,
      priceMinor: priceResult.success ? priceResult.valueMinor : 0,
      currency,
      images: parseListInput(imagesText, /\n/),
      colors: parseListInput(colorsText),
      sizes: parseListInput(sizesText),
      styleTags: parseListInput(styleTagsText),
      material,
      availability,
      isActive,
    };

    const parsed = adminProductFormSchema.safeParse(candidate);
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
    }
    // Overrides the schema's generic priceMinor message (if any) with the
    // more specific reason parsePriceInputToMinor already worked out.
    if (!priceResult.success) {
      nextErrors.priceMinor = priceResult.error;
    }
    if (!parsed.success || !priceResult.success) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createProduct(parsed.data);
        showToast({
          title: "Product created",
          description: `"${parsed.data.name}" was added to the catalog.`,
          variant: "success",
        });
      } else if (product) {
        await updateProduct(product.id, parsed.data);
        showToast({ title: "Product updated", description: `"${parsed.data.name}" was saved.`, variant: "success" });
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
      showToast({ title: "Could not save product", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {formError && (
        <p role="alert" className="rounded-md border border-error/20 bg-error-bg p-4 text-base text-error">
          {formError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Name" required error={fieldErrors.name}>
          {(field) => (
            <Input {...field} value={name} onChange={(event) => handleNameChange(event.target.value)} required />
          )}
        </FormField>

        <FormField label="Slug" required error={fieldErrors.slug} hint="URL-safe identifier, e.g. leather-belt">
          {(field) => (
            <Input
              {...field}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              required
            />
          )}
        </FormField>
      </div>

      <FormField label="Description" error={fieldErrors.description}>
        {(field) => (
          <Textarea
            {...field}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
          />
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Category" required error={fieldErrors.category}>
          {(field) => (
            <Select value={category} onValueChange={(value) => setCategory(value as Category)} required>
              <SelectTrigger {...field}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {CATEGORY_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField label="Availability" required error={fieldErrors.availability}>
          {(field) => (
            <Select value={availability} onValueChange={(value) => setAvailability(value as Availability)} required>
              <SelectTrigger {...field}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {AVAILABILITY_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Price" required error={fieldErrors.priceMinor}>
          {(field) => (
            <Input
              {...field}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          )}
        </FormField>

        <FormField label="Currency" required error={fieldErrors.currency} hint="3-letter ISO code, e.g. EUR">
          {(field) => (
            <Input
              {...field}
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              maxLength={3}
              required
            />
          )}
        </FormField>
      </div>

      <FormField label="Material" required error={fieldErrors.material}>
        {(field) => <Input {...field} value={material} onChange={(event) => setMaterial(event.target.value)} required />}
      </FormField>

      <FormField
        label="Image URLs"
        required
        error={
          invalidImageUrls.length > 0
            ? `${invalidImageUrls.length === 1 ? "This URL is" : "These URLs are"} not on an allowed image host: ${invalidImageUrls.join(", ")}. Allowed hosts (https only): ${ALLOWED_IMAGE_HOSTS.join(", ")}`
            : fieldErrors.images
        }
        hint="One image URL per line. The first is used as the primary image."
      >
        {(field) => (
          <Textarea {...field} value={imagesText} onChange={(event) => setImagesText(event.target.value)} rows={3} />
        )}
      </FormField>

      {validImagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-3" aria-hidden="true">
          {validImagePreviews.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- lightweight preview of arbitrary pasted URLs, not a catalog image
            <img
              key={`${src}-${index}`}
              src={src}
              alt=""
              className="size-16 rounded-md border border-border object-cover"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <FormField label="Colors" required error={fieldErrors.colors} hint="Comma-separated, e.g. black, brown">
          {(field) => (
            <Input {...field} value={colorsText} onChange={(event) => setColorsText(event.target.value)} required />
          )}
        </FormField>

        <FormField label="Sizes" required error={fieldErrors.sizes} hint="Comma-separated, e.g. S, M, L">
          {(field) => (
            <Input {...field} value={sizesText} onChange={(event) => setSizesText(event.target.value)} required />
          )}
        </FormField>

        <FormField label="Style tags" error={fieldErrors.styleTags} hint="Comma-separated, e.g. minimal, casual">
          {(field) => (
            <Input {...field} value={styleTagsText} onChange={(event) => setStyleTagsText(event.target.value)} />
          )}
        </FormField>
      </div>

      <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 text-base text-foreground">
        <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
        Active (visible in the public catalog)
      </label>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting} loadingText="Saving...">
          {mode === "create" ? "Create product" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
