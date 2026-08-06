import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Button } from "./button";

describe("Button", () => {
  it("renders children and responds to click", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save outfit</Button>);
    const button = screen.getByRole("button", { name: "Save outfit" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables interaction and announces busy state while loading", () => {
    render(
      <Button loading loadingText="Saving...">
        Save outfit
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Saving..." });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Save outfit</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
