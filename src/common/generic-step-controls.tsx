// Generic controls that work for any step-based solver
import { Button } from "../components/ui/button";

interface GenericStepControlsProps {
  onNext: () => void;
  onPrev: () => void;
  onSolveAll: () => void;
  canNext: boolean;
  canPrev: boolean;
  canSolveAll: boolean;
  customControls?: React.ReactNode; // For solver-specific buttons
}

export default function GenericStepControls({
  onNext,
  onPrev,
  onSolveAll,
  canNext,
  canPrev,
  canSolveAll,
  customControls,
}: GenericStepControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center p-4 bg-gray-50 rounded-lg">
      <Button variant="outline" onClick={onPrev} disabled={!canPrev}>
        ← Previous Step
      </Button>
      <Button onClick={onNext} disabled={!canNext}>
        Next Step →
      </Button>
      <Button variant="secondary" onClick={onSolveAll} disabled={!canSolveAll}>
        🚀 Solve All Steps
      </Button>
      {customControls}
    </div>
  );
}
