import { TransportationState, findAllocation } from "../transportation-logic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import TransportationMODITableau from "./transportation-modi-tableau";

interface TransportationTableauProps {
  state: TransportationState;
}

export default function TransportationTableau({
  state,
}: TransportationTableauProps) {
  // If MODI method, use specialized MODI tableau
  if (state.method === "MODI") {
    return <TransportationMODITableau state={state} />;
  }

  const { problem, allocations, remainingSupply, remainingDemand } = state;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Transportation Tableau</h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center font-medium">
                From\\To
              </TableHead>
              {problem.demandLabels.map((label, i) => (
                <TableHead key={i} className="text-center font-medium">
                  {label}
                </TableHead>
              ))}
              <TableHead className="text-center font-medium bg-blue-50">
                Supply
              </TableHead>
              <TableHead className="text-center font-medium bg-blue-50">
                Remaining
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problem.supplyLabels.map((supplyLabel, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium bg-gray-50">
                  {supplyLabel}
                </TableCell>
                {problem.demandLabels.map((_, j) => {
                  const allocation = findAllocation(allocations, i, j);
                  const cost = problem.costs[i][j];
                  const isAllocated = allocation && allocation.value > 0;

                  return (
                    <TableCell
                      key={j}
                      className={`relative border-2 ${
                        isAllocated
                          ? "bg-green-100 border-green-400"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-xs font-medium mb-1">{cost}</div>
                        {isAllocated && (
                          <div className="text-sm font-bold text-green-800">
                            {allocation.value}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center bg-blue-50 font-medium">
                  {problem.supply[i]}
                </TableCell>
                <TableCell
                  className={`text-center font-medium ${
                    remainingSupply[i] === 0
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-50"
                  }`}
                >
                  {remainingSupply[i]}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-medium bg-green-50">Demand</TableCell>
              {problem.demand.map((demand, j) => (
                <TableCell
                  key={j}
                  className="text-center bg-green-50 font-medium"
                >
                  {demand}
                </TableCell>
              ))}
              <TableCell className="bg-gray-50"></TableCell>
              <TableCell className="bg-gray-50"></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-green-50">
                Remaining
              </TableCell>
              {remainingDemand.map((remaining, j) => (
                <TableCell
                  key={j}
                  className={`text-center font-medium ${
                    remaining === 0
                      ? "bg-green-100 text-green-800"
                      : "bg-green-50"
                  }`}
                >
                  {remaining}
                </TableCell>
              ))}
              <TableCell className="bg-gray-50"></TableCell>
              <TableCell className="bg-gray-50"></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Current allocations summary */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">Current Allocations:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {allocations
            .filter((a) => a.value > 0)
            .map((alloc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-green-50 rounded text-sm"
              >
                <span>
                  ({problem.supplyLabels[alloc.row]},{" "}
                  {problem.demandLabels[alloc.col]})
                </span>
                <span className="font-medium">
                  {alloc.value} units × {problem.costs[alloc.row][alloc.col]} ={" "}
                  {alloc.value * problem.costs[alloc.row][alloc.col]}
                </span>
              </div>
            ))}
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded">
          <div className="text-lg font-semibold text-blue-800">
            Total Transportation Cost: {state.totalCost}
          </div>
        </div>
      </div>
    </div>
  );
}
