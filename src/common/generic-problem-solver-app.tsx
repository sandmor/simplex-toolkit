// Generic Problem Solver App Container
// This component abstracts the common app structure used by all three problem types
import { useState, ReactNode } from "react";
import GenericStepControls from "./generic-step-controls";

export interface ProblemSolverConfig<TProblem, TState> {
  title: string;
  subtitle: string;
  icon: string;
  emptyStateMessage: string;
  emptyStateIcon: string;

  // Solver functions
  initializeProblem: (problem: TProblem) => TState;
  performStep: (state: TState) => TState;
  solveCompletely: (state: TState) => TState[];
  isComplete: (state: TState) => boolean;

  // Component factories
  createProblemDefinition: (props: {
    onProblemSubmit: (problem: TProblem) => void;
  }) => ReactNode;
  createTableau: (props: { state: TState }) => ReactNode;
  createExplanation: (props: { state: TState }) => ReactNode;
  createSolution: (props: { state: TState }) => ReactNode;
  createCustomControls?: (props: {
    state: TState;
    onCustomAction?: (actionType: string, data?: unknown) => void;
  }) => ReactNode;
}

interface GenericProblemSolverAppProps<TProblem, TState> {
  config: ProblemSolverConfig<TProblem, TState>;
}

export default function GenericProblemSolverApp<TProblem, TState>({
  config,
}: GenericProblemSolverAppProps<TProblem, TState>) {
  const [history, setHistory] = useState<TState[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [problemSubmitted, setProblemSubmitted] = useState<boolean>(false);

  const currentState = history[currentStep];
  const canNext = currentState ? !config.isComplete(currentState) : false;
  const canPrev = currentStep > 0;
  const canSolveAll = currentState ? !config.isComplete(currentState) : false;

  const handleProblemSubmit = (problem: TProblem) => {
    const initialState = config.initializeProblem(problem);
    setHistory([initialState]);
    setCurrentStep(0);
    setProblemSubmitted(true);
  };

  const handleNextStep = () => {
    if (!canNext || !currentState) return;

    const nextState = config.performStep(currentState);
    setHistory([...history.slice(0, currentStep + 1), nextState]);
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (canPrev) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSolveAll = () => {
    if (!canSolveAll || !currentState) return;

    const allSteps = config.solveCompletely(currentState);
    // Replace from current step onwards
    const newHistory = [...history.slice(0, currentStep), ...allSteps];
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const handleCustomAction = (actionType: string, data?: unknown) => {
    // Handle custom actions that might modify the solver state
    if (actionType === "addState" && data) {
      // Add a new state to history (useful for MODI optimization)
      const newHistory = [...history, data as TState];
      setHistory(newHistory);
      setCurrentStep(newHistory.length - 1);
    }
    // Other custom actions can be added here
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {config.icon} {config.title}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {config.subtitle}
        </p>
      </div>

      {/* Problem Definition */}
      {config.createProblemDefinition({ onProblemSubmit: handleProblemSubmit })}

      {/* Main Content */}
      {!problemSubmitted ? (
        <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-3">{config.emptyStateIcon}</div>
            <p className="text-gray-500 text-lg">{config.emptyStateMessage}</p>
          </div>
        </div>
      ) : currentState ? (
        <div className="space-y-6">
          {config.createTableau({ state: currentState })}
          {config.createExplanation({ state: currentState })}

          <GenericStepControls
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSolveAll={handleSolveAll}
            canNext={canNext}
            canPrev={canPrev}
            canSolveAll={canSolveAll}
            customControls={config.createCustomControls?.({
              state: currentState,
              onCustomAction: handleCustomAction,
            })}
          />

          {config.createSolution({ state: currentState })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 border rounded-md">
          <p className="text-muted-foreground">Initializing solver...</p>
        </div>
      )}
    </div>
  );
}
