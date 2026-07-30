import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SortableColumnHeader } from "./sortable-column-header";

function renderHeader(overrides: Partial<Parameters<typeof SortableColumnHeader>[0]> = {}) {
  return render(
    <table>
      <thead>
        <tr>
          <SortableColumnHeader
            label="Price"
            field="price"
            currentSortBy="createdAt"
            currentSortDirection="desc"
            rawSearchParams={{}}
            {...overrides}
          />
        </tr>
      </thead>
    </table>,
  );
}

describe("SortableColumnHeader", () => {
  it("links to ascending order when the column is not currently active", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /Price/ })).toHaveAttribute(
      "href",
      "/admin/products?sortBy=price&sortDirection=asc",
    );
  });

  it("toggles to descending order when already sorted ascending", () => {
    renderHeader({ currentSortBy: "price", currentSortDirection: "asc" });
    expect(screen.getByRole("link", { name: /Price/ })).toHaveAttribute(
      "href",
      "/admin/products?sortBy=price&sortDirection=desc",
    );
  });

  it("preserves other search params such as search and page", () => {
    renderHeader({ rawSearchParams: { search: "leather", page: "2" } });
    expect(screen.getByRole("link", { name: /Price/ })).toHaveAttribute(
      "href",
      "/admin/products?search=leather&sortBy=price&sortDirection=asc",
    );
  });
});
