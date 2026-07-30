import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders and accepts text", () => {
    render(<Textarea aria-label="Description" onChange={() => {}} />);
    const textarea = screen.getByRole("textbox", { name: "Description" });
    fireEvent.change(textarea, { target: { value: "A cozy denim jacket." } });
    expect(textarea).toHaveValue("A cozy denim jacket.");
  });

  it("marks the invalid state accessibly", () => {
    render(<Textarea aria-label="Description" aria-invalid />);
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveAttribute("aria-invalid", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Textarea aria-label="Description" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
