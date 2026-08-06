import { z } from "zod";

// Single "admin" role for the MVP — multiple admin roles are an open
// question for later.
export const adminUserRoleSchema = z.enum(["admin"]);
export type AdminUserRole = z.infer<typeof adminUserRoleSchema>;

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: adminUserRoleSchema,
});

export type AdminUser = z.infer<typeof adminUserSchema>;
