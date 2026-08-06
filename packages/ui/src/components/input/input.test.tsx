import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Input } from "./input";

describe("Input", () => {
  it("renders and accepts text", () => {
    render(<Input aria-label="Search" onChange={() => {}} />);
    const input = screen.getByRole("textbox", { name: "Search" });
    fireEvent.change(input, { target: { value: "denim jacket" } });
    expect(input).toHaveValue("denim jacket");
  });

  it("marks the invalid state accessibly", () => {
    render(<Input aria-label="Email" aria-invalid />);
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Input aria-label="Search" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
