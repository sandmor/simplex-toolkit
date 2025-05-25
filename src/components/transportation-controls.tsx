import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  InitialMethod,
  TransportationMethod,
} from "../transportation-logic/types";

interface TransportationControlsProps {
  onNext: () => void;
  onPrev: () => void;
  onSolveAll: () => void;
  onMethodChange: (method: InitialMethod) => void;
  onOptimizeWithMODI?: () => void;
  canNext: boolean;
  canPrev: boolean;
  canSolveAll: boolean;
  canOptimizeWithMODI?: boolean;
  currentMethod: InitialMethod;
  currentSolutionMethod?: TransportationMethod; // For displaying when in MODI mode
}

export default function TransportationControls({
  onNext,
  onPrev,
  onSolveAll,
  onMethodChange,
  onOptimizeWithMODI,
  canNext,
  canPrev,
  canSolveAll,
  canOptimizeWithMODI,
  currentMethod,
  currentSolutionMethod,
}: TransportationControlsProps) {
  const methods: Array<{
    id: InitialMethod;
    name: string;
    description: string;
  }> = [
    {
      id: "NWC",
      name: "Northwest Corner",
      description: "Simple but may not yield good initial solution",
    },
    {
      id: "LCM",
      name: "Least Cost",
      description: "Better initial solution by selecting minimum costs",
    },
    {
      id: "VAM",
      name: "Vogel's Approximation",
      description: "Often yields near-optimal initial solution",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Method Selection */}
      <div className="space-y-2">
        <h4 className="font-medium">Select Solution Method:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                currentMethod === method.id
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{method.name}</span>
                {currentMethod === method.id && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {method.description}
              </p>
            </button>
          ))}
        </div>

        {/* MODI Optimization Section */}
        {currentSolutionMethod === "MODI" && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-purple-800">
                MODI Optimization Active
              </span>
              <Badge
                variant="secondary"
                className="text-xs bg-purple-100 text-purple-800"
              >
                Optimizing
              </Badge>
            </div>
            <p className="text-xs text-purple-700">
              Using Modified Distribution method to optimize the initial
              solution
            </p>
          </div>
        )}
      </div>

      {/* Step Controls */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onPrev} disabled={!canPrev}>
          ← Previous Step
        </Button>
        <Button onClick={onNext} disabled={!canNext}>
          Next Step →
        </Button>
        <Button
          variant="secondary"
          onClick={onSolveAll}
          disabled={!canSolveAll}
        >
          🚀 Solve All Steps
        </Button>
        {canOptimizeWithMODI && onOptimizeWithMODI && (
          <Button
            variant="default"
            onClick={onOptimizeWithMODI}
            className="bg-purple-600 hover:bg-purple-700"
          >
            ⚡ Optimize with MODI
          </Button>
        )}
      </div>
    </div>
  );
}
