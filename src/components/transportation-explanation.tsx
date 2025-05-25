import { TransportationState, getMethodName } from "../transportation-logic";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TransportationExplanationProps {
  state: TransportationState;
}

export default function TransportationExplanation({
  state,
}: TransportationExplanationProps) {
  const getMethodDescription = (method: "NWC" | "LCM" | "VAM" | "MODI") => {
    switch (method) {
      case "NWC":
        return "The Northwest Corner Method starts from the top-left cell and allocates as much as possible before moving to the next available cell.";
      case "LCM":
        return "The Least Cost Method always selects the cell with the minimum transportation cost among all available cells.";
      case "VAM":
        return "Vogel's Approximation Method calculates penalties for each row and column, then selects the cell with minimum cost in the row/column with highest penalty.";
      case "MODI":
        return "The MODI (Modified Distribution) Method uses dual variables (ui, vj) to find opportunity costs and iteratively improves the solution until optimality.";
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="text-lg">
          {getMethodName(state.method)} - Step {state.step}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Method Description:
          </h4>
          <p className="text-sm text-blue-700">
            {getMethodDescription(state.method)}
          </p>
        </div>

        {/* MODI-specific information */}
        {state.method === "MODI" && state.modiData && (
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">MODI Progress:</h4>
            <div className="text-sm text-purple-700 space-y-1">
              {state.modiData.uValues.some((u) => u === undefined) ||
              state.modiData.vValues.some((v) => v === undefined) ? (
                <p>🔄 Calculating dual variables (ui, vj)...</p>
              ) : (
                <p>✅ Dual variables calculated</p>
              )}

              {state.isOptimal !== undefined && (
                <p>
                  {state.isOptimal
                    ? "🎯 Optimal solution found!"
                    : "🔍 Solution not optimal, improving..."}
                </p>
              )}

              {state.modiData.enteringCell && (
                <p>
                  📍 Entering variable: x({state.modiData.enteringCell.row + 1},
                  {state.modiData.enteringCell.col + 1})
                </p>
              )}

              {state.modiData.theta !== null && (
                <p>📐 θ = {state.modiData.theta}</p>
              )}
            </div>
          </div>
        )}

        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Current Step:</h4>
          <p className="text-sm text-gray-700">{state.explanation}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <div className="font-medium text-green-800">Status</div>
            <div className="text-green-700 capitalize">{state.status}</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <div className="font-medium text-purple-800">Current Cost</div>
            <div className="text-purple-700 font-mono">{state.totalCost}</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-center">
            <div className="font-medium text-orange-800">Allocations</div>
            <div className="text-orange-700">
              {state.allocations.filter((a) => a.value > 0).length}
            </div>
          </div>
        </div>

        {state.status === "Complete" && (
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">
              ✓ Solution Complete
            </h4>
            <p className="text-sm text-green-700">
              {getMethodName(state.method)} has found an initial basic feasible
              solution with total cost of {state.totalCost}. This may not be the
              optimal solution - further optimization using methods like MODI or
              Stepping Stone is recommended.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
