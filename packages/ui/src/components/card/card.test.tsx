import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

describe("Card", () => {
  it("renders composed sections", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Denim Jacket</CardTitle>
          <CardDescription>Classic fit</CardDescription>
        </CardHeader>
        <CardContent>&euro;89.00</CardContent>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Denim Jacket" })).toBeInTheDocument();
    expect(screen.getByText("Classic fit")).toBeInTheDocument();
  });

  it("renders the title at the requested heading level", () => {
    render(<CardTitle as="h2">Outfit summary</CardTitle>);
    expect(screen.getByRole("heading", { level: 2, name: "Outfit summary" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Denim Jacket</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
