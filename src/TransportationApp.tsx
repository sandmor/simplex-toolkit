// Transportation Problem Solver using generic components
import { useState } from "react";
import GenericProblemSolverApp, {
  ProblemSolverConfig,
} from "./common/generic-problem-solver-app";
import TransportationProblemDefinition from "./components/transportation-problem-definition";
import TransportationTableau from "./components/transportation-tableau";
import TransportationExplanation from "./components/transportation-explanation";
import TransportationSolution from "./components/transportation-solution";
import { Button } from "./components/ui/button";
import {
  TransportationProblem,
  TransportationState,
  InitialMethod,
  initializeTransportationProblem,
  performTransportationStep,
  solveTransportationProblem,
} from "./transportation-logic";
import { initializeMODI } from "./transportation-logic/modi";

export default function TransportationApp() {
  const [selectedMethod, setSelectedMethod] = useState<InitialMethod>("VAM");

  const handleMethodChange = (method: InitialMethod) => {
    setSelectedMethod(method);
    // The problem will be re-initialized with the new method when submitted
  };

  const handleOptimizeWithMODI = (currentState: TransportationState) => {
    if (!currentState || currentState.status !== "Complete") return null;
    return initializeMODI(currentState);
  };

  // Solver configuration
  const solverConfig: ProblemSolverConfig<
    TransportationProblem,
    TransportationState
  > = {
    title: "Transportation Problem Solver",
    subtitle:
      "Solve transportation problems step-by-step using three classic methods: Northwest Corner, Least Cost, and Vogel's Approximation Method. Then optimize solutions further using the MODI algorithm.",
    icon: "🚚",
    emptyStateMessage:
      "Define and submit a transportation problem above to get started",
    emptyStateIcon: "📊",

    // Solver functions
    initializeProblem: (problem: TransportationProblem) => {
      return initializeTransportationProblem(problem, selectedMethod);
    },

    performStep: (state: TransportationState) => {
      return performTransportationStep(state);
    },

    solveCompletely: (state: TransportationState) => {
      return solveTransportationProblem(state);
    },

    isComplete: (state: TransportationState) => {
      return state.status === "Complete";
    },

    // Component factories
    createProblemDefinition: ({ onProblemSubmit }) => (
      <TransportationProblemDefinition onProblemSubmit={onProblemSubmit} />
    ),

    createTableau: ({ state }) => <TransportationTableau state={state} />,

    createExplanation: ({ state }) => (
      <TransportationExplanation state={state} />
    ),

    createSolution: ({ state }) => <TransportationSolution state={state} />,

    createCustomControls: ({ state, onCustomAction }) => {
      const canOptimizeWithMODI =
        state &&
        state.status === "Complete" &&
        state.method !== "MODI" &&
        state.allocations.length > 0;

      return (
        <div className="flex gap-2 mt-4">
          <div className="flex gap-1">
            <Button
              variant={selectedMethod === "NWC" ? "default" : "outline"}
              onClick={() => handleMethodChange("NWC")}
              size="sm"
            >
              Northwest Corner
            </Button>
            <Button
              variant={selectedMethod === "LCM" ? "default" : "outline"}
              onClick={() => handleMethodChange("LCM")}
              size="sm"
            >
              Least Cost
            </Button>
            <Button
              variant={selectedMethod === "VAM" ? "default" : "outline"}
              onClick={() => handleMethodChange("VAM")}
              size="sm"
            >
              VAM
            </Button>
          </div>

          {canOptimizeWithMODI && onCustomAction && (
            <Button
              variant="secondary"
              onClick={() => {
                const modiState = handleOptimizeWithMODI(state);
                if (modiState) {
                  onCustomAction("addState", modiState);
                }
              }}
            >
              Optimize with MODI
            </Button>
          )}

          <div className="ml-auto text-sm text-muted-foreground">
            Current method: {state.method}
          </div>
        </div>
      );
    },
  };

  return <GenericProblemSolverApp config={solverConfig} />;
}
