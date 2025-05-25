import { HungarianState } from "../assignment-logic";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AssignmentSolutionProps {
  state: HungarianState;
}

export default function AssignmentSolution({ state }: AssignmentSolutionProps) {
  // Show solution only for completed states
  if (state.status !== "Complete") return null;

  const { problem, assignments, totalCost } = state;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl text-green-700">
          🎯 Optimal Assignment Found
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Solution Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Solution Summary</h3>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800 mb-1">
                Total {problem.isMaximization ? "Benefit" : "Cost"}: {totalCost}
              </div>
              <div className="text-sm text-green-600">
                {problem.isMaximization
                  ? "Maximum total benefit achieved using Hungarian Method"
                  : "Minimum total cost achieved using Hungarian Method"}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Assignment Plan:</h4>
              {assignments.map((assignment, index) => {
                const cost = problem.costs[assignment.row][assignment.col];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded"
                  >
                    <span className="font-medium">
                      {problem.rowLabels[assignment.row]} →{" "}
                      {problem.colLabels[assignment.col]}
                    </span>
                    <span className="text-sm font-mono">
                      {problem.isMaximization ? "Benefit" : "Cost"}: {cost}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Method Performance */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Method Analysis</h3>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Method Used</h4>
              <div className="text-blue-700">Hungarian Method</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded text-center">
                <div className="font-medium text-purple-800">Steps</div>
                <div className="text-purple-700">{state.step}</div>
              </div>
              <div className="p-3 bg-orange-50 rounded text-center">
                <div className="font-medium text-orange-800">Assignments</div>
                <div className="text-orange-700">{assignments.length}</div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">Note</h4>
              <p className="text-sm text-yellow-700">
                The Hungarian Method guarantees finding the optimal assignment
                that
                {problem.isMaximization
                  ? " maximizes total benefit"
                  : " minimizes total cost"}
                . This solution is mathematically proven to be optimal.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Assignment Table */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Assignment Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-50"></th>
                  {problem.colLabels.map((label, j) => (
                    <th
                      key={j}
                      className="border border-gray-300 p-2 bg-gray-50 text-center"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problem.rowLabels.map((rowLabel, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                      {rowLabel}
                    </td>
                    {problem.colLabels.map((_, j) => {
                      const isAssigned = assignments.some(
                        (a) => a.row === i && a.col === j
                      );
                      return (
                        <td
                          key={j}
                          className={`border border-gray-300 p-2 text-center ${
                            isAssigned
                              ? "bg-green-100 font-bold text-green-800"
                              : "bg-gray-50"
                          }`}
                        >
                          {isAssigned ? (
                            <>
                              ✓
                              <div className="text-xs text-green-600">
                                {problem.costs[i][j]}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
