export {
  categorySchema,
  OPTIONAL_CATEGORIES,
  REQUIRED_CATEGORIES,
  type Category,
} from "./domain/category.js";
export {
  adminProductFormSchema,
  adminProductUpdateSchema,
  availabilitySchema,
  productFiltersSchema,
  productSchema,
  type AdminProductFormInput,
  type AdminProductUpdateInput,
  type Availability,
  type Product,
  type ProductFilters,
} from "./domain/product.js";
export { outfitItemSchema, type OutfitItem } from "./domain/outfit-item.js";
export {
  createOutfitInputSchema,
  outfitSchema,
  validationStatusSchema,
  type CreateOutfitInput,
  type Outfit,
  type ValidationStatus,
} from "./domain/outfit.js";
export {
  compatibilityRuleTypeSchema,
  compatibilitySeveritySchema,
  compatibilityWarningSchema,
  type CompatibilityRuleType,
  type CompatibilitySeverity,
  type CompatibilityWarning,
} from "./domain/compatibility-rule.js";
export {
  adminUserRoleSchema,
  adminUserSchema,
  type AdminUser,
  type AdminUserRole,
} from "./domain/admin-user.js";
export {
  tryOnRequestInputSchema,
  tryOnResponseSchema,
  tryOnStatusSchema,
  type TryOnRequestInput,
  type TryOnResponse,
  type TryOnStatus,
} from "./domain/try-on.js";

export { calculateOutfitTotalPrice, type OutfitPrice, type PricedOutfitItem } from "./logic/price.js";
export {
  validateOutfitCompleteness,
  type OutfitCompletenessResult,
} from "./logic/completeness.js";
export {
  getCompatibilityWarnings,
  type CompatibilityCheckItem,
} from "./logic/compatibility.js";

export { signAdminToken, verifyAdminToken, type AdminJwtPayload } from "./auth/admin-token.js";
