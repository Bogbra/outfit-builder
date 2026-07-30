"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTrigger,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  Label,
  LoadingSkeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@outfit-builder/ui";
import { useState } from "react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-b border-border py-12 first:pt-0 last:border-b-0">
      <h2 className="font-heading text-2xl font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function DesignSystemView() {
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" loading loadingText="Saving...">
            Save outfit
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Input & FormField">
        <div className="grid max-w-sm gap-4">
          <FormField label="Outfit name" hint="Visible to you only">
            {(field) => <Input {...field} placeholder="Weekend brunch" />}
          </FormField>
          <FormField label="Email" error={emailError} required>
            {(field) => (
              <Input
                {...field}
                type="email"
                placeholder="you@example.com"
                onBlur={(event) => setEmailError(event.target.value ? undefined : "Email is required")}
              />
            )}
          </FormField>
        </div>
      </Section>

      <Section title="Checkbox">
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 text-base text-foreground">
          <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
          Save this outfit to my collection
        </label>
      </Section>

      <Section title="Select">
        <div className="max-w-xs">
          <Label htmlFor="size-select">Size</Label>
          <Select>
            <SelectTrigger id="size-select" className="mt-2">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="s">S</SelectItem>
              <SelectItem value="m">M</SelectItem>
              <SelectItem value="l">L</SelectItem>
              <SelectItem value="xl">XL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-3">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="success">In stock</Badge>
          <Badge variant="warning">Low stock</Badge>
          <Badge variant="error">Out of stock</Badge>
          <Badge variant="info">New</Badge>
          <Badge variant="accent">Editor&apos;s pick</Badge>
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Denim Jacket</CardTitle>
            <CardDescription>Classic fit, indigo wash</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base text-foreground">&euro;89.00</p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="self-start">
              Delete outfit
            </Button>
          </DialogTrigger>
          <DialogContent title="Delete outfit" description="This action cannot be undone.">
            <div className="flex justify-end gap-3">
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Empty state">
        <EmptyState
          title="No saved outfits yet"
          description="Build an outfit and save it to see it here."
          action={<Button variant="primary">Start building</Button>}
        />
      </Section>

      <Section title="Error state">
        <ErrorState
          description="We could not load your saved outfits. Please try again."
          action={<Button variant="secondary">Retry</Button>}
        />
      </Section>

      <Section title="Loading skeleton">
        <div className="flex max-w-sm flex-col gap-3">
          <LoadingSkeleton className="h-40 w-full" />
          <LoadingSkeleton className="h-6 w-3/4" />
          <LoadingSkeleton className="h-6 w-1/2" />
        </div>
      </Section>
    </>
  );
}
