import { z } from "zod";

// Single "admin" role for the MVP — see docs/open-questions.md
// ("more than one admin role?").
export const adminUserRoleSchema = z.enum(["admin"]);
export type AdminUserRole = z.infer<typeof adminUserRoleSchema>;

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: adminUserRoleSchema,
});

export type AdminUser = z.infer<typeof adminUserSchema>;
