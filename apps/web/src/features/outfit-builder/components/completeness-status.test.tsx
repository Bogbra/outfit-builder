import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { CompletenessStatus } from "./completeness-status";

describe("CompletenessStatus", () => {
  it("shows a complete state", () => {
    render(<CompletenessStatus completeness={{ isComplete: true, missingRequiredCategories: [] }} />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("lists missing required categories", () => {
    render(
      <CompletenessStatus completeness={{ isComplete: false, missingRequiredCategories: ["top", "shoes"] }} />,
    );
    expect(screen.getByText(/still needed: top, shoes/i)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <CompletenessStatus completeness={{ isComplete: false, missingRequiredCategories: ["top"] }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
