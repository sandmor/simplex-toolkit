// Assignment Problem Solver using generic components
import GenericProblemSolverApp, {
  ProblemSolverConfig,
} from "./common/generic-problem-solver-app";
import AssignmentProblemDefinition from "./components/assignment-problem-definition";
import AssignmentTableau from "./components/assignment-tableau";
import AssignmentExplanation from "./components/assignment-explanation";
import AssignmentSolution from "./components/assignment-solution";
import {
  AssignmentProblem,
  HungarianState,
  initializeHungarianProblem,
  performAssignmentStep,
  solveAssignmentProblem,
} from "./assignment-logic";

export default function AssignmentApp() {
  // Solver configuration
  const solverConfig: ProblemSolverConfig<AssignmentProblem, HungarianState> = {
    title: "Assignment Problem Solver",
    subtitle:
      "Solve assignment problems step-by-step using the Hungarian Method. Find the optimal assignment of workers to tasks that minimizes total cost or maximizes total benefit.",
    icon: "🎯",
    emptyStateMessage:
      "Define and submit an assignment problem above to get started",
    emptyStateIcon: "🎯",

    // Solver functions
    initializeProblem: (problem: AssignmentProblem) => {
      return initializeHungarianProblem(problem);
    },

    performStep: (state: HungarianState) => {
      return performAssignmentStep(state);
    },

    solveCompletely: (state: HungarianState) => {
      return solveAssignmentProblem(state);
    },

    isComplete: (state: HungarianState) => {
      return state.status === "Complete";
    },

    // Component factories
    createProblemDefinition: ({ onProblemSubmit }) => (
      <AssignmentProblemDefinition onProblemSubmit={onProblemSubmit} />
    ),

    createTableau: ({ state }) => <AssignmentTableau state={state} />,

    createExplanation: ({ state }) => <AssignmentExplanation state={state} />,

    createSolution: ({ state }) => <AssignmentSolution state={state} />,

    // No custom controls needed for Assignment problem
    createCustomControls: undefined,
  };

  return <GenericProblemSolverApp config={solverConfig} />;
}
