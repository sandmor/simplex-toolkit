import { useState, useEffect } from "react";
import Tableau from "./components/tableau.tsx";
import Controls from "./components/controls.tsx";
import Explanation from "./components/explanation.tsx";
import Solution from "./components/solution.tsx";
import ProblemDefinition from "./components/problem-definition.tsx";
import TransportationApp from "./TransportationApp.tsx";
import { cloneDeep } from "lodash";
import {
  SimplexState,
  performSimplexIteration,
  interpretSolution,
  initializeProblem,
  Objective,
  Constraint,
} from "./simplex-logic/big-m";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card.tsx";
import { Button } from "./components/ui/button.tsx";

// Default problem used as fallback
const defaultProblem = {
  objective: { coefficients: [3, 5], variables: ["x1", "x2"] },
  constraints: [
    {
      coefficients: [1, 1],
      variables: ["x1", "x2"],
      type: ">=" as const,
      rhs: 3,
    },
    {
      coefficients: [1, 2],
      variables: ["x1", "x2"],
      type: ">=" as const,
      rhs: 4,
    },
  ],
  isMaximization: false,
};

// Build the dual problem from a primal definition
function buildDualProblem(primal: {
  objective: Objective;
  constraints: Constraint[];
  isMaximization: boolean;
}) {
  const { objective, constraints, isMaximization } = primal;
  // Exclude non-negativity (x>=0) constraints
  const relevant = constraints.filter((c) => !(c.type === ">=" && c.rhs === 0));

  // Dual objective: coefficients = RHS of relevant primal constraints
  const dualCoeffs = relevant.map((c) => c.rhs);
  const dualVars = relevant.map((_, i) => `y${i + 1}`);
  // Dual constraints: one per primal variable
  const dualConstraints: Constraint[] = objective.variables.map((_, j) => {
    const coeffs = relevant.map((c) => c.coefficients[j]);
    const rhs = objective.coefficients[j];
    // Type flips: primal max => dual >=, primal min => dual <=
    const type: ">=" | "<=" = isMaximization ? ">=" : "<=";
    return { variables: [...dualVars], coefficients: coeffs, type, rhs };
  });
  return {
    objective: { variables: dualVars, coefficients: dualCoeffs },
    constraints: dualConstraints,
    isMaximization: !isMaximization,
  };
}

function App() {
  const [currentMode, setCurrentMode] = useState<"simplex" | "transportation">(
    "simplex"
  );
  const [history, setHistory] = useState<SimplexState[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  // New editing states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedState, setEditedState] = useState<SimplexState | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [finalInterpretation, setFinalInterpretation] = useState<string>("");
  const [currentProblem, setCurrentProblem] = useState<{
    objective: Objective;
    constraints: Constraint[];
    isMaximization: boolean;
  }>(defaultProblem);
  const [problemSubmitted, setProblemSubmitted] = useState<boolean>(false);
  const [showFormulation, setShowFormulation] = useState<boolean>(false);
  const [showDual, setShowDual] = useState<boolean>(false);

  // Initialize when problem is submitted/changed or toggling dual/primal
  useEffect(() => {
    if (!problemSubmitted) return;
    const problemDef = showDual
      ? buildDualProblem(currentProblem)
      : currentProblem;
    const initialState = initializeProblem(
      problemDef.objective,
      problemDef.constraints,
      problemDef.isMaximization
    );
    setHistory([initialState]);
    setCurrentStep(0);
    setIsSolved(false);
    setFinalInterpretation("");
  }, [problemSubmitted, currentProblem, showDual]);

  const handleProblemSubmit = (problem: {
    objective: Objective;
    constraints: Constraint[];
    isMaximization: boolean;
  }) => {
    setCurrentProblem(problem);
    setProblemSubmitted(true);
  };

  const handleNextStep = () => {
    if (isSolved) return;

    const currentState = history[currentStep];
    if (["Optimal", "Infeasible", "Unbounded"].includes(currentState.status)) {
      setIsSolved(true);
      setFinalInterpretation(interpretSolution(currentState));
      return;
    }

    // IMPORTANT: Need a robust deep clone that handles MNumber objects
    const nextState = performSimplexIteration(cloneDeep(currentState));

    setHistory([...history.slice(0, currentStep + 1), nextState]);
    setCurrentStep(currentStep + 1);

    if (["Optimal", "Infeasible", "Unbounded"].includes(nextState.status)) {
      setIsSolved(true);
      setFinalInterpretation(interpretSolution(nextState));
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsSolved(false); // Can always go back from solved state
      setFinalInterpretation("");
    }
  };

  const handleSolveAll = () => {
    if (isSolved) return;
    let current = history[currentStep];
    const steps: SimplexState[] = [];
    let safetyBreak = 0; // Prevent infinite loops

    while (
      !["Optimal", "Infeasible", "Unbounded"].includes(current.status) &&
      safetyBreak < 100
    ) {
      // IMPORTANT: Deep clone needed
      current = performSimplexIteration(cloneDeep(current));
      steps.push(current);
      safetyBreak++;
    }

    if (steps.length > 0) {
      setHistory([...history.slice(0, currentStep + 1), ...steps]);
      setCurrentStep(history.length - 1 + steps.length); // Go to last new step
    }
    setIsSolved(true);
    setFinalInterpretation(interpretSolution(current));

    if (safetyBreak >= 100) {
      setFinalInterpretation(
        "Solver stopped after 100 iterations. Check for cycling or errors."
      );
      setIsSolved(true); // Treat as solved/stopped
    }
  };

  // Toggle edit mode and commit/cancel edits
  const handleToggleEdit = () => {
    if (!isEditing) {
      // Enter edit mode: clone current state
      setEditedState(cloneDeep(history[currentStep]));
      setIsEditing(true);
    } else {
      // Exit edit mode: commit edits
      if (editedState) {
        const newHistory = [...history];
        newHistory[currentStep] = editedState;
        setHistory(newHistory);
      }
      setEditedState(null);
      setIsEditing(false);
    }
  };

  // Determine the state to display: either edited or current
  const displayState =
    isEditing && editedState ? editedState : history[currentStep];

  return (
    <div className="App max-w-5xl mx-auto p-6">
      {/* Mode Selection Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Linear Programming Toolbox
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Choose your problem type and solve step-by-step
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={currentMode === "simplex" ? "default" : "outline"}
            onClick={() => setCurrentMode("simplex")}
            className="px-6 py-3"
          >
            📊 Simplex Method
          </Button>
          <Button
            variant={currentMode === "transportation" ? "default" : "outline"}
            onClick={() => setCurrentMode("transportation")}
            className="px-6 py-3"
          >
            🚚 Transportation Problem
          </Button>
        </div>
      </div>

      {/* Conditional Rendering based on mode */}
      {currentMode === "transportation" ? (
        <TransportationApp />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Simplex Solver (Step-by-Step)
          </h2>

          <ProblemDefinition onProblemSubmit={handleProblemSubmit} />

          {!problemSubmitted ? (
            <div className="flex items-center justify-center p-8 border rounded-md">
              <p className="text-muted-foreground">
                Define and submit a problem above to get started
              </p>
            </div>
          ) : displayState ? (
            <>
              {showFormulation && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Problem Formulation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre
                      className="whitespace-pre-wrap font-mono text-sm"
                      dangerouslySetInnerHTML={{
                        __html: displayState.formulation,
                      }}
                    />
                  </CardContent>
                </Card>
              )}
              <div className="bg-card rounded-lg border shadow-sm p-4">
                <h2 className="text-2xl font-semibold mb-4">
                  Tableau - Step {currentStep + 1}
                </h2>

                <Tableau
                  state={displayState}
                  showDual={showDual}
                  editing={isEditing}
                  onStateChange={setEditedState!}
                />

                <Explanation state={displayState} />

                <Controls
                  onNext={handleNextStep}
                  onPrev={handlePrevStep}
                  onSolveAll={handleSolveAll}
                  canPrev={currentStep > 0}
                  canNext={!isSolved && !isEditing}
                  canSolveAll={!isSolved && !isEditing}
                  showFormulation={showFormulation}
                  onToggleFormulation={() =>
                    setShowFormulation(!showFormulation)
                  }
                  showDual={showDual}
                  onToggleDual={() => setShowDual(!showDual)}
                  showEditMode={isEditing}
                  onToggleEdit={handleToggleEdit}
                />
              </div>

              {isSolved && <Solution interpretation={finalInterpretation} />}
            </>
          ) : (
            <div className="flex items-center justify-center h-32 border rounded-md">
              <p className="text-muted-foreground">Initializing solver...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
