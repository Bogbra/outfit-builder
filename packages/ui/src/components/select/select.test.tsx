import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

function renderSelect() {
  return render(
    <Select>
      <SelectTrigger aria-label="Size">
        <SelectValue placeholder="Select a size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="s">S</SelectItem>
        <SelectItem value="m">M</SelectItem>
        <SelectItem value="l">L</SelectItem>
      </SelectContent>
    </Select>,
  );
}

describe("Select", () => {
  it("renders a labelled, closed trigger with placeholder text", () => {
    renderSelect();
    const trigger = screen.getByRole("combobox", { name: "Size" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Select a size")).toBeInTheDocument();
  });

  it("has no accessibility violations in its closed state", async () => {
    const { container } = renderSelect();
    expect(await axe(container)).toHaveNoViolations();
  });
});
