import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { dismissToast, getSnapshot, showToast } from "./toast-store";
import { Toaster } from "./toaster";

describe("Toaster", () => {
  afterEach(() => {
    act(() => {
      for (const toast of getSnapshot()) {
        dismissToast(toast.id);
      }
    });
  });

  it("renders a success toast", () => {
    render(<Toaster />);
    act(() => {
      showToast({ title: "Outfit saved", variant: "success" });
    });
    expect(screen.getByText("Outfit saved")).toBeInTheDocument();
  });

  it("renders a description alongside the title", () => {
    render(<Toaster />);
    act(() => {
      showToast({ title: "Could not save", description: "Please try again.", variant: "error" });
    });
    expect(screen.getByText("Could not save")).toBeInTheDocument();
    expect(screen.getByText("Please try again.")).toBeInTheDocument();
  });

  it("dismisses a toast when its close button is clicked", () => {
    render(<Toaster />);
    act(() => {
      showToast({ title: "Outfit saved", variant: "success" });
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Outfit saved")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Toaster />);
    act(() => {
      showToast({ title: "Outfit saved", variant: "success" });
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
