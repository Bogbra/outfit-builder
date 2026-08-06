import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("announces itself as an alert", () => {
    render(<ErrorState description="Could not load products." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load products.");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ErrorState />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
