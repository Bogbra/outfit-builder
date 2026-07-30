import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { AdminProductSearchForm } from "./admin-product-search-form";

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/admin/products",
  useSearchParams: () => currentSearchParams,
}));

describe("AdminProductSearchForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
    currentSearchParams = new URLSearchParams();
  });

  it("navigates with a search param and resets pagination on submit", () => {
    render(<AdminProductSearchForm />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search products" }), {
      target: { value: "leather" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(pushMock).toHaveBeenCalledWith("/admin/products?search=leather");
  });

  it("drops the page param but keeps sort params when re-searching", () => {
    currentSearchParams = new URLSearchParams({ sortBy: "price", sortDirection: "asc", page: "3" });
    render(<AdminProductSearchForm />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search products" }), {
      target: { value: "denim" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(pushMock).toHaveBeenCalledWith("/admin/products?sortBy=price&sortDirection=asc&search=denim");
  });

  it("navigates without a search param when the field is cleared", () => {
    currentSearchParams = new URLSearchParams({ search: "leather" });
    render(<AdminProductSearchForm />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search products" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(pushMock).toHaveBeenCalledWith("/admin/products");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<AdminProductSearchForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
