import { HungarianState } from "../assignment-logic";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface AssignmentTableauProps {
  state: HungarianState;
}

export default function AssignmentTableau({ state }: AssignmentTableauProps) {
  const {
    problem,
    costMatrix,
    markedMatrix,
    coveredRows,
    coveredCols,
    currentPhase,
  } = state;

  const getPhaseDisplay = (phase: string) => {
    switch (phase) {
      case "reduce_rows":
        return "Row Reduction";
      case "reduce_cols":
        return "Column Reduction";
      case "cover_zeros":
        return "Cover Zeros";
      case "find_assignment":
        return "Find Assignment";
      case "adjust_matrix":
        return "Adjust Matrix";
      case "complete":
        return "Complete";
      default:
        return phase;
    }
  };

  const getCellClass = (i: number, j: number) => {
    let classes = "relative border-2 p-3 text-center";

    // Base styling
    if (coveredRows[i] && coveredCols[j]) {
      classes += " bg-purple-100 border-purple-300"; // Doubly covered
    } else if (coveredRows[i]) {
      classes += " bg-blue-100 border-blue-300"; // Row covered
    } else if (coveredCols[j]) {
      classes += " bg-green-100 border-green-300"; // Column covered
    } else {
      classes += " bg-white border-gray-200"; // Uncovered
    }

    // Mark styling
    const mark = markedMatrix[i][j];
    if (mark === "starred") {
      classes += " ring-4 ring-yellow-400";
    } else if (mark === "primed") {
      classes += " ring-4 ring-red-400";
    }

    return classes;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Hungarian Method - Step {state.step}</span>
          <Badge variant="secondary" className="text-sm">
            {getPhaseDisplay(currentPhase)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Problem Type */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {problem.isMaximization ? "Maximization" : "Minimization"}{" "}
              Assignment Problem
              {problem.isMaximization && " (converted to minimization)"}
            </p>
          </div>

          {/* Cost Matrix */}
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {problem.colLabels.map((label, j) => (
                    <th
                      key={j}
                      className={`p-2 text-center font-medium ${
                        coveredCols[j] ? "bg-green-200" : "bg-gray-50"
                      }`}
                    >
                      {label}
                      {coveredCols[j] && (
                        <div className="text-xs text-green-600 mt-1">
                          Covered
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costMatrix.map((row, i) => (
                  <tr key={i}>
                    <td
                      className={`p-2 text-center font-medium ${
                        coveredRows[i] ? "bg-blue-200" : "bg-gray-50"
                      }`}
                    >
                      {problem.rowLabels[i]}
                      {coveredRows[i] && (
                        <div className="text-xs text-blue-600 mt-1">
                          Covered
                        </div>
                      )}
                    </td>
                    {row.map((cost, j) => (
                      <td key={j} className={getCellClass(i, j)}>
                        <div className="flex flex-col items-center space-y-1">
                          {/* Cost value */}
                          <div className="text-lg font-mono font-medium">
                            {cost}
                          </div>

                          {/* Marks */}
                          {markedMatrix[i][j] === "starred" && (
                            <div className="text-yellow-600 text-lg">★</div>
                          )}
                          {markedMatrix[i][j] === "primed" && (
                            <div className="text-red-600 text-lg">′</div>
                          )}

                          {/* Zero indicator */}
                          {cost === 0 && !markedMatrix[i][j] && (
                            <div className="text-gray-400 text-xs">0</div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span>Row Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span>Column Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded relative">
                <div className="absolute inset-0 ring-4 ring-yellow-400 rounded"></div>
              </div>
              <span>Starred Zero (★)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded relative">
                <div className="absolute inset-0 ring-4 ring-red-400 rounded"></div>
              </div>
              <span>Primed Zero (′)</span>
            </div>
          </div>

          {/* Current Status */}
          {state.minUncoveredValue !== undefined && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                Minimum uncovered value:{" "}
                <span className="font-mono font-bold">
                  {state.minUncoveredValue}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
