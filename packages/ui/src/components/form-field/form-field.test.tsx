import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Input } from "../input/input";
import { FormField } from "./form-field";

describe("FormField", () => {
  it("connects the label and error message to the field via aria-describedby", () => {
    render(
      <FormField label="Email" error="Email is required">
        {(field) => <Input {...field} />}
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FormField label="Email" hint="We will never share it">
        {(field) => <Input {...field} />}
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
