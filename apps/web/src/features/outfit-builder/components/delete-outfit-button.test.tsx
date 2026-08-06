import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { DeleteOutfitButton } from "./delete-outfit-button";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const deleteOutfitMock = vi.fn();

vi.mock("../api/delete-outfit", () => ({
  deleteOutfit: (...args: unknown[]) => deleteOutfitMock(...args),
}));

describe("DeleteOutfitButton", () => {
  beforeEach(() => {
    refreshMock.mockClear();
    deleteOutfitMock.mockReset();
  });

  it("asks for confirmation before deleting", () => {
    render(<DeleteOutfitButton id="outfit-1" name="Weekend brunch" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText(/Are you sure you want to delete "Weekend brunch"/)).toBeInTheDocument();
    expect(deleteOutfitMock).not.toHaveBeenCalled();
  });

  it("deletes the outfit and refreshes when confirmed", async () => {
    deleteOutfitMock.mockResolvedValue(undefined);
    render(<DeleteOutfitButton id="outfit-1" name="Weekend brunch" />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const deleteButtons = await screen.findAllByRole("button", { name: "Delete" });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]!);

    await waitFor(() => expect(deleteOutfitMock).toHaveBeenCalledWith("outfit-1"));
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("closes without deleting when cancelled", () => {
    render(<DeleteOutfitButton id="outfit-1" name="Weekend brunch" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(deleteOutfitMock).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DeleteOutfitButton id="outfit-1" name="Weekend brunch" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
