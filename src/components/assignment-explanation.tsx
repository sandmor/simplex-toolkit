import { HungarianState } from "../assignment-logic";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AssignmentExplanationProps {
  state: HungarianState;
}

export default function AssignmentExplanation({
  state,
}: AssignmentExplanationProps) {
  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case "reduce_rows":
        return "Subtract the minimum value in each row from all elements in that row. This creates at least one zero in each row without changing the optimal assignment.";
      case "reduce_cols":
        return "Subtract the minimum value in each column from all elements in that column. This creates additional zeros without changing the optimal assignment.";
      case "cover_zeros":
        return "Find the minimum number of lines needed to cover all zeros. Star independent zeros (no two in the same row or column) and cover their columns.";
      case "find_assignment":
        return "If the number of covered columns equals the matrix size, the starred zeros represent the optimal assignment.";
      case "adjust_matrix":
        return "Find the smallest uncovered value, subtract it from all uncovered elements, and add it to elements covered by both a row and column line. This creates new zeros.";
      case "complete":
        return "The Hungarian Method has found the optimal assignment that minimizes the total cost.";
      default:
        return "Processing assignment problem using the Hungarian Method.";
    }
  };

  const getCurrentPhaseInfo = () => {
    switch (state.currentPhase) {
      case "reduce_rows":
        return {
          title: "🔢 Row Reduction Phase",
          color: "blue",
          description: "Creating zeros by reducing rows",
        };
      case "reduce_cols":
        return {
          title: "📊 Column Reduction Phase",
          color: "green",
          description: "Creating additional zeros by reducing columns",
        };
      case "cover_zeros":
        return {
          title: "🎯 Zero Coverage Phase",
          color: "purple",
          description: "Finding and starring independent zeros",
        };
      case "find_assignment":
        return {
          title: "✅ Assignment Phase",
          color: "emerald",
          description: "Optimal assignment found!",
        };
      case "adjust_matrix":
        return {
          title: "⚡ Matrix Adjustment Phase",
          color: "orange",
          description: "Creating new zeros to find better assignment",
        };
      case "complete":
        return {
          title: "🎉 Complete",
          color: "green",
          description: "Hungarian Method completed successfully",
        };
      default:
        return {
          title: "🔄 Processing",
          color: "gray",
          description: "Working on assignment problem",
        };
    }
  };

  const phaseInfo = getCurrentPhaseInfo();

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="text-lg">
          Hungarian Method - Step {state.step}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Method Description */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            About the Hungarian Method:
          </h4>
          <p className="text-sm text-blue-700">
            The Hungarian Method is a combinatorial optimization algorithm that
            solves assignment problems in polynomial time. It finds the optimal
            assignment of workers to tasks that minimizes total cost (or
            maximizes total benefit).
          </p>
        </div>

        {/* Current Phase */}
        <div
          className={`p-3 bg-${phaseInfo.color}-50 border border-${phaseInfo.color}-200 rounded-lg`}
        >
          <h4 className={`font-medium text-${phaseInfo.color}-800 mb-2`}>
            {phaseInfo.title}
          </h4>
          <p className={`text-sm text-${phaseInfo.color}-700 mb-2`}>
            {phaseInfo.description}
          </p>
          <p className={`text-sm text-${phaseInfo.color}-600`}>
            {getPhaseDescription(state.currentPhase)}
          </p>
        </div>

        {/* Current Step Explanation */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Current Step:</h4>
          <p className="text-sm text-gray-700">{state.explanation}</p>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <div className="font-medium text-green-800">Status</div>
            <div className="text-green-700 capitalize">{state.status}</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <div className="font-medium text-purple-800">Current Cost</div>
            <div className="text-purple-700 font-mono">
              {state.totalCost > 0 ? state.totalCost : "Calculating..."}
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-center">
            <div className="font-medium text-orange-800">Assignments</div>
            <div className="text-orange-700">{state.assignments.length}</div>
          </div>
        </div>

        {/* Completion Status */}
        {state.status === "Complete" && (
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">
              ✓ Optimal Assignment Found!
            </h4>
            <p className="text-sm text-green-700">
              The Hungarian Method has successfully found the optimal assignment
              with minimum total cost of {state.totalCost}. Each worker is
              assigned to exactly one task, and each task is assigned to exactly
              one worker.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
