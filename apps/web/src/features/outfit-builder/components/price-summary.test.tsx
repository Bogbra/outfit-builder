import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PriceSummary } from "./price-summary";

describe("PriceSummary", () => {
  it("formats the total price in the outfit's currency", () => {
    render(<PriceSummary price={{ totalPrice: 258.99, currency: "EUR" }} />);
    expect(screen.getByText("€258.99")).toBeInTheDocument();
  });

  it("shows a placeholder when the outfit is empty", () => {
    render(<PriceSummary price={{ totalPrice: 0, currency: null }} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
