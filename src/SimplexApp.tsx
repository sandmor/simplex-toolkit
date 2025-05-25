// Simplex Method implementation using generic components
import { useState } from "react";
import { cloneDeep } from "lodash";
import GenericProblemSolverApp, {
  ProblemSolverConfig,
} from "./common/generic-problem-solver-app";
import ProblemDefinition from "./components/problem-definition";
import Tableau from "./components/tableau";
import Explanation from "./components/explanation";
import Solution from "./components/solution";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {
  SimplexState,
  performSimplexIteration,
  interpretSolution,
  initializeProblem,
  Objective,
  Constraint,
} from "./simplex-logic/big-m";

// Types for Simplex problem
interface SimplexProblem {
  objective: Objective;
  constraints: Constraint[];
  isMaximization: boolean;
}

// Default problem definition used for initialization

// Build the dual problem
function buildDualProblem(primal: SimplexProblem): SimplexProblem {
  const { objective, constraints, isMaximization } = primal;
  const relevant = constraints.filter((c) => !(c.type === ">=" && c.rhs === 0));

  const dualCoeffs = relevant.map((c) => c.rhs);
  const dualVars = relevant.map((_, i) => `y${i + 1}`);
  const dualConstraints: Constraint[] = objective.variables.map((_, j) => {
    const coeffs = relevant.map((c) => c.coefficients[j]);
    const rhs = objective.coefficients[j];
    const type: ">=" | "<=" = isMaximization ? ">=" : "<=";
    return { variables: [...dualVars], coefficients: coeffs, type, rhs };
  });

  return {
    objective: { variables: dualVars, coefficients: dualCoeffs },
    constraints: dualConstraints,
    isMaximization: !isMaximization,
  };
}

export default function SimplexApp() {
  const [showFormulation, setShowFormulation] = useState(false);
  const [showDual, setShowDual] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedState, setEditedState] = useState<SimplexState | null>(null);
  const [finalInterpretation, setFinalInterpretation] = useState("");

  // Solver configuration
  const solverConfig: ProblemSolverConfig<SimplexProblem, SimplexState> = {
    title: "Simplex Method",
    subtitle:
      "Solve linear programming problems step-by-step using the Simplex algorithm",
    icon: "📊",
    emptyStateMessage: "Define and submit a problem above to get started",
    emptyStateIcon: "📋",

    // Solver functions
    initializeProblem: (problem: SimplexProblem) => {
      const problemDef = showDual ? buildDualProblem(problem) : problem;
      return initializeProblem(
        problemDef.objective,
        problemDef.constraints,
        problemDef.isMaximization
      );
    },

    performStep: (state: SimplexState) => {
      return performSimplexIteration(cloneDeep(state));
    },

    solveCompletely: (state: SimplexState) => {
      const steps: SimplexState[] = [];
      let current = cloneDeep(state);
      let safetyBreak = 0;

      while (
        !["Optimal", "Infeasible", "Unbounded"].includes(current.status) &&
        safetyBreak < 100
      ) {
        current = performSimplexIteration(cloneDeep(current));
        steps.push(current);
        safetyBreak++;
      }

      if (safetyBreak >= 100) {
        setFinalInterpretation(
          "Solver stopped after 100 iterations. Check for cycling or errors."
        );
      } else {
        setFinalInterpretation(interpretSolution(current));
      }

      return steps;
    },

    isComplete: (state: SimplexState) => {
      return ["Optimal", "Infeasible", "Unbounded"].includes(state.status);
    },

    // Component factories
    createProblemDefinition: ({ onProblemSubmit }) => (
      <ProblemDefinition onProblemSubmit={onProblemSubmit} />
    ),

    createTableau: ({ state }) => {
      const displayState = isEditing && editedState ? editedState : state;
      return (
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
              Tableau - Current Step
            </h2>
            <Tableau
              state={displayState}
              showDual={showDual}
              editing={isEditing}
              onStateChange={setEditedState}
            />
          </div>
        </>
      );
    },

    createExplanation: ({ state }) => <Explanation state={state} />,

    createSolution: ({ state }) => {
      if (["Optimal", "Infeasible", "Unbounded"].includes(state.status)) {
        const interpretation = finalInterpretation || interpretSolution(state);
        return <Solution interpretation={interpretation} />;
      }
      return null;
    },

    createCustomControls: ({ state }) => (
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setShowFormulation(!showFormulation)}
        >
          {showFormulation ? "Hide" : "Show"} Formulation
        </Button>
        <Button variant="outline" onClick={() => setShowDual(!showDual)}>
          {showDual ? "Show Primal" : "Show Dual"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!isEditing) {
              setEditedState(cloneDeep(state));
              setIsEditing(true);
            } else {
              setEditedState(null);
              setIsEditing(false);
            }
          }}
        >
          {isEditing ? "Cancel Edit" : "Edit Tableau"}
        </Button>
      </div>
    ),
  };

  return <GenericProblemSolverApp config={solverConfig} />;
}
