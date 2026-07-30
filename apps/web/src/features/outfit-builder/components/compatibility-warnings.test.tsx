import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompatibilityWarnings } from "./compatibility-warnings";

describe("CompatibilityWarnings", () => {
  it("renders nothing when there are no warnings", () => {
    const { container } = render(<CompatibilityWarnings warnings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders each warning as an alert", () => {
    render(
      <CompatibilityWarnings
        warnings={[
          { type: "style-overlap", severity: "warning", message: "Styles don't match." },
          { type: "color-count", severity: "warning", message: "Too many colors." },
        ]}
      />,
    );
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });
});
