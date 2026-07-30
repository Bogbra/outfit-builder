import type { OutfitCompletenessResult } from "@outfit-builder/contracts";
import { Badge } from "@outfit-builder/ui";

import { CATEGORY_LABEL } from "../lib/category-labels";

export interface CompletenessStatusProps {
  completeness: OutfitCompletenessResult;
}

export function CompletenessStatus({ completeness }: CompletenessStatusProps) {
  if (completeness.isComplete) {
    return (
      <div role="status" className="flex flex-wrap items-center gap-2">
        <Badge variant="success">Complete</Badge>
        <p className="text-base text-muted-foreground">Your outfit has everything it needs.</p>
      </div>
    );
  }

  const missing = completeness.missingRequiredCategories.map((category) => CATEGORY_LABEL[category]).join(", ");

  return (
    <div role="status" className="flex flex-wrap items-center gap-2">
      <Badge variant="warning">Incomplete</Badge>
      <p className="text-base text-muted-foreground">Still needed: {missing}</p>
    </div>
  );
}
