import { FC } from "react";
import { Button } from "./ui/button";

interface ControlsProps {
  onNext: () => void;
  onPrev: () => void;
  onSolveAll: () => void;
  canNext: boolean;
  canPrev: boolean;
  canSolveAll: boolean;
  showFormulation: boolean;
  onToggleFormulation: () => void;
  showDual: boolean;
  onToggleDual: () => void;
  showEditMode: boolean;
  onToggleEdit: () => void;
}

const Controls: FC<ControlsProps> = ({
  onNext,
  onPrev,
  onSolveAll,
  canNext,
  canPrev,
  canSolveAll,
  showFormulation,
  onToggleFormulation,
  showDual,
  onToggleDual,
  showEditMode,
  onToggleEdit,
}) => {
  return (
    <div className="flex gap-2 my-4">
      <Button variant="outline" onClick={onPrev} disabled={!canPrev}>
        Previous Step
      </Button>
      <Button onClick={onNext} disabled={!canNext}>
        Next Step
      </Button>
      <Button variant="secondary" onClick={onSolveAll} disabled={!canSolveAll}>
        Solve All
      </Button>
      <Button variant="ghost" onClick={onToggleFormulation}>
        {showFormulation ? "Hide Formulation" : "Show Formulation"}
      </Button>
      <Button variant="ghost" onClick={onToggleDual}>
        {showDual ? "Show Primal" : "Show Dual"}
      </Button>
      <Button variant="outline" onClick={onToggleEdit}>
        {showEditMode ? "Save Edits" : "Edit Tableau"}
      </Button>
    </div>
  );
};

export default Controls;
