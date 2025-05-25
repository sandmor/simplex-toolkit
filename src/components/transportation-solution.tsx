import { TransportationState } from "../transportation-logic";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TransportationSolutionProps {
  state: TransportationState;
}

export default function TransportationSolution({
  state,
}: TransportationSolutionProps) {
  // Show solution for completed states OR MODI optimization states
  if (state.status !== "Complete" && state.method !== "MODI") return null;

  const { problem, allocations, totalCost } = state;
  const activeAllocations = allocations.filter((a) => a.value > 0);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl text-green-700">
          🎯 Transportation Solution Found
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Solution Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Solution Summary</h3>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800 mb-1">
                Total Cost: {totalCost}
              </div>
              <div className="text-sm text-green-600">
                {state.method === "MODI"
                  ? `Optimized transportation cost using MODI method`
                  : `Initial transportation cost using ${state.method}`}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Transportation Plan:</h4>
              {activeAllocations.map((alloc, index) => {
                const cost = problem.costs[alloc.row][alloc.col];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded"
                  >
                    <span className="font-medium">
                      {problem.supplyLabels[alloc.row]} →{" "}
                      {problem.demandLabels[alloc.col]}
                    </span>
                    <span className="text-sm">
                      {alloc.value} units × {cost} = {alloc.value * cost}
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
              <div className="text-blue-700">
                {state.method === "NWC" && "Northwest Corner Method"}
                {state.method === "LCM" && "Least Cost Method"}
                {state.method === "VAM" && "Vogel's Approximation Method"}
                {state.method === "MODI" &&
                  "MODI (Modified Distribution) Method"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded text-center">
                <div className="font-medium text-purple-800">Steps</div>
                <div className="text-purple-700">{state.step}</div>
              </div>
              <div className="p-3 bg-orange-50 rounded text-center">
                <div className="font-medium text-orange-800">Allocations</div>
                <div className="text-orange-700">
                  {activeAllocations.length}
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">Note</h4>
              <p className="text-sm text-yellow-700">
                {state.method === "MODI"
                  ? "This solution has been optimized using the MODI method and should be optimal or near-optimal."
                  : "This is an initial basic feasible solution. For the optimal solution, apply optimization methods like MODI or Stepping Stone Method."}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Allocation Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-3">
            Detailed Allocation Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-50">
                    From\\To
                  </th>
                  {problem.demandLabels.map((label, i) => (
                    <th
                      key={i}
                      className="border border-gray-300 p-2 bg-gray-50"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="border border-gray-300 p-2 bg-blue-50">
                    Supply
                  </th>
                </tr>
              </thead>
              <tbody>
                {problem.supplyLabels.map((supplyLabel, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                      {supplyLabel}
                    </td>
                    {problem.demandLabels.map((_, j) => {
                      const alloc = allocations.find(
                        (a) => a.row === i && a.col === j
                      );
                      const hasAllocation = alloc && alloc.value > 0;
                      return (
                        <td
                          key={j}
                          className={`border border-gray-300 p-2 text-center ${
                            hasAllocation ? "bg-green-100 font-bold" : ""
                          }`}
                        >
                          {hasAllocation ? alloc.value : "—"}
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-2 text-center bg-blue-50">
                      {problem.supply[i]}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-gray-300 p-2 bg-green-50 font-medium">
                    Demand
                  </td>
                  {problem.demand.map((demand, j) => (
                    <td
                      key={j}
                      className="border border-gray-300 p-2 text-center bg-green-50"
                    >
                      {demand}
                    </td>
                  ))}
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
