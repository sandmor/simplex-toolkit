import { Button } from "./ui/button";

interface AssignmentControlsProps {
  onNext: () => void;
  onPrev: () => void;
  onSolveAll: () => void;
  canNext: boolean;
  canPrev: boolean;
  canSolveAll: boolean;
}

export default function AssignmentControls({
  onNext,
  onPrev,
  onSolveAll,
  canNext,
  canPrev,
  canSolveAll,
}: AssignmentControlsProps) {
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
    </div>
  );
}
