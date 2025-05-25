import { useState } from "react";
import TransportationProblemDefinition from "./components/transportation-problem-definition";
import TransportationTableau from "./components/transportation-tableau";
import TransportationExplanation from "./components/transportation-explanation";
import TransportationControls from "./components/transportation-controls";
import TransportationSolution from "./components/transportation-solution";
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
  const [currentProblem, setCurrentProblem] =
    useState<TransportationProblem | null>(null);
  const [history, setHistory] = useState<TransportationState[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [problemSubmitted, setProblemSubmitted] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<InitialMethod>("VAM");

  const handleProblemSubmit = (problem: TransportationProblem) => {
    setCurrentProblem(problem);
    const initialState = initializeTransportationProblem(
      problem,
      selectedMethod
    );
    setHistory([initialState]);
    setCurrentStep(0);
    setProblemSubmitted(true);
  };

  const handleMethodChange = (method: InitialMethod) => {
    setSelectedMethod(method);
    if (currentProblem) {
      // Restart with new method
      const initialState = initializeTransportationProblem(
        currentProblem,
        method
      );
      setHistory([initialState]);
      setCurrentStep(0);
    }
  };

  const handleNextStep = () => {
    const currentState = history[currentStep];
    if (currentState.status === "Complete") return;

    const nextState = performTransportationStep(currentState);
    setHistory([...history.slice(0, currentStep + 1), nextState]);
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSolveAll = () => {
    const currentState = history[currentStep];
    if (currentState.status === "Complete") return;

    const allSteps = solveTransportationProblem(currentState);
    // Replace from current step onwards
    const newHistory = [...history.slice(0, currentStep), ...allSteps];
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const handleOptimizeWithMODI = () => {
    const currentState = history[currentStep];
    if (!currentState || currentState.status !== "Complete") return;

    // Initialize MODI properly using the existing function
    const modiState = initializeMODI(currentState);

    // Add the MODI state to history and switch to it
    const newHistory = [...history, modiState];
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const currentState = history[currentStep];
  const canNext = currentState && currentState.status !== "Complete";
  const canPrev = currentStep > 0;
  const canSolveAll = currentState && currentState.status !== "Complete";
  const canOptimizeWithMODI =
    currentState &&
    currentState.status === "Complete" &&
    currentState.method !== "MODI" &&
    currentState.allocations.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🚚 Transportation Problem Solver
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Solve transportation problems step-by-step using three classic
          methods: Northwest Corner, Least Cost, and Vogel's Approximation
          Method. Then optimize solutions further using the MODI algorithm.
        </p>
      </div>

      <TransportationProblemDefinition onProblemSubmit={handleProblemSubmit} />

      {!problemSubmitted ? (
        <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-500 text-lg">
              Define and submit a transportation problem above to get started
            </p>
          </div>
        </div>
      ) : currentState ? (
        <div className="space-y-6">
          <TransportationTableau state={currentState} />
          <TransportationExplanation state={currentState} />
          <TransportationControls
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSolveAll={handleSolveAll}
            onMethodChange={handleMethodChange}
            onOptimizeWithMODI={handleOptimizeWithMODI}
            canNext={canNext}
            canPrev={canPrev}
            canSolveAll={canSolveAll}
            canOptimizeWithMODI={canOptimizeWithMODI}
            currentMethod={selectedMethod}
            currentSolutionMethod={currentState.method}
          />
          <TransportationSolution state={currentState} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 border rounded-md">
          <p className="text-muted-foreground">
            Initializing transportation solver...
          </p>
        </div>
      )}
    </div>
  );
}
