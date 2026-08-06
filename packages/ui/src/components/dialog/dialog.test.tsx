import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Dialog, DialogContent } from "./dialog";

describe("Dialog", () => {
  it("shows a visible title, description and close control when open", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent title="Delete outfit" description="This cannot be undone.">
          <p>Are you sure?</p>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("heading", { name: "Delete outfit" })).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
  });

  it("has no accessibility violations when open", async () => {
    const { baseElement } = render(
      <Dialog defaultOpen>
        <DialogContent title="Delete outfit">
          <p>Are you sure?</p>
        </DialogContent>
      </Dialog>,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
