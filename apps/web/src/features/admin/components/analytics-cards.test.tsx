import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { AnalyticsCards } from "./analytics-cards";

describe("AnalyticsCards", () => {
  it("renders the analytics values", () => {
    render(
      <AnalyticsCards
        analytics={{
          totalProducts: 24,
          totalSavedOutfits: 2,
          mostUsedCategory: "top",
          averageOutfitPrice: 59,
        }}
      />,
    );

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("top")).toBeInTheDocument();
    expect(screen.getByText("€59.00")).toBeInTheDocument();
  });

  it("shows a placeholder when there is no data yet", () => {
    render(
      <AnalyticsCards
        analytics={{
          totalProducts: 0,
          totalSavedOutfits: 0,
          mostUsedCategory: null,
          averageOutfitPrice: null,
        }}
      />,
    );

    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AnalyticsCards
        analytics={{ totalProducts: 24, totalSavedOutfits: 2, mostUsedCategory: "top", averageOutfitPrice: 59 }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
