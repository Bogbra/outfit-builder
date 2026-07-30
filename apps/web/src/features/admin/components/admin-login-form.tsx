"use client";

import { Button, FormField, Input } from "@outfit-builder/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

interface LoginErrorResponse {
  error?: string;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as LoginErrorResponse | null;
        setError(json?.error ?? "Login failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-base text-error">
          {error}
        </p>
      )}
      <FormField label="Email">
        {(field) => (
          <Input
            {...field}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        )}
      </FormField>
      <FormField label="Password">
        {(field) => (
          <Input
            {...field}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        )}
      </FormField>
      <Button type="submit" variant="primary" loading={isSubmitting} loadingText="Signing in...">
        Sign in
      </Button>
    </form>
  );
}
