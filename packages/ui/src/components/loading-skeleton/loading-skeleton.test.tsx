import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { LoadingSkeleton } from "./loading-skeleton";

describe("LoadingSkeleton", () => {
  it("exposes a loading status for assistive tech", () => {
    render(<LoadingSkeleton className="h-4 w-32" />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<LoadingSkeleton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
