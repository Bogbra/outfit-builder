import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { FilterPanel } from "./filter-panel";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const props = { colors: ["black", "white"], sizes: ["S", "M"], styleTags: ["casual"] };

describe("FilterPanel", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("renders filter controls", () => {
    render(<FilterPanel {...props} />);
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Category" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Color" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Size" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Style" })).toBeInTheDocument();
  });

  it("navigates with updated search params when submitting", () => {
    render(<FilterPanel {...props} />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "denim" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    expect(pushMock).toHaveBeenCalledWith("/?search=denim");
  });

  it("navigates home with no params on reset", () => {
    render(<FilterPanel {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<FilterPanel {...props} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
