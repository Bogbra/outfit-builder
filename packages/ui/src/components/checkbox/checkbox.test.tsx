import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("toggles checked state and reports it accessibly", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Select item" onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole("checkbox", { name: "Select item" });
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Checkbox aria-label="Select item" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
