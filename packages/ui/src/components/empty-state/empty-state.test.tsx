import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title, description and action", () => {
    render(
      <EmptyState
        title="No outfits yet"
        description="Start building your first outfit."
        action={<button type="button">Create outfit</button>}
      />,
    );
    expect(screen.getByRole("heading", { name: "No outfits yet" })).toBeInTheDocument();
    expect(screen.getByText("Start building your first outfit.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create outfit" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<EmptyState title="No outfits yet" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
