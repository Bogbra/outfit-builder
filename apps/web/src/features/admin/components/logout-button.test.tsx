import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { LogoutButton } from "./logout-button";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
    );
  });

  it("logs out and redirects to the login page", async () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin/login"));
    expect(fetch).toHaveBeenCalledWith("/api/admin/logout", { method: "POST" });
    expect(refreshMock).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<LogoutButton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
