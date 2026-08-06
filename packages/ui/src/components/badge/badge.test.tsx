import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge variant="success">In stock</Badge>);
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
