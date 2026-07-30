// vitest-axe@0.1.0 augments the legacy `Vi.Assertion` namespace, which
// Vitest 2.x no longer reads (assertions are typed via the `vitest` module
// directly). Re-declare the matcher here so `toHaveNoViolations` typechecks.
import "vitest";

declare module "vitest" {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
}
