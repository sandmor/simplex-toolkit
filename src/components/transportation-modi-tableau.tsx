import { TransportationState, findAllocation } from "../transportation-logic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

interface TransportationMODITableauProps {
  state: TransportationState;
}

export default function TransportationMODITableau({
  state,
}: TransportationMODITableauProps) {
  const { problem, allocations, modiData } = state;

  if (!modiData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">MODI Tableau</h3>
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
          MODI data not yet calculated
        </div>
      </div>
    );
  }

  const { uValues, vValues, opportunityCosts, enteringCell, loop } = modiData;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">MODI Tableau</h3>

      {/* Dual Variables Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Row Multipliers (u<sub>i</sub>)
          </h4>
          <div className="space-y-1">
            {uValues.map((u, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  u<sub>{i + 1}</sub>:
                </span>
                <span className="font-mono">
                  {u !== undefined ? u.toFixed(2) : "?"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">
            Column Multipliers (v<sub>j</sub>)
          </h4>
          <div className="space-y-1">
            {vValues.map((v, j) => (
              <div key={j} className="flex justify-between">
                <span>
                  v<sub>{j + 1}</sub>:
                </span>
                <span className="font-mono">
                  {v !== undefined ? v.toFixed(2) : "?"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transportation Table with MODI Data */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center font-medium">
                From\\To
              </TableHead>
              {problem.demandLabels.map((label, j) => (
                <TableHead key={j} className="text-center font-medium">
                  {label}
                  {vValues[j] !== undefined && (
                    <div className="text-xs text-green-700 font-normal">
                      v<sub>{j + 1}</sub> = {vValues[j]?.toFixed(2)}
                    </div>
                  )}
                </TableHead>
              ))}
              <TableHead className="text-center font-medium bg-blue-50">
                Supply
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problem.supplyLabels.map((supplyLabel, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium bg-gray-50">
                  {supplyLabel}
                  {uValues[i] !== undefined && (
                    <div className="text-xs text-blue-700">
                      u<sub>{i + 1}</sub> = {uValues[i]?.toFixed(2)}
                    </div>
                  )}
                </TableCell>
                {problem.demandLabels.map((_, j) => {
                  const allocation = findAllocation(allocations, i, j);
                  const cost = problem.costs[i][j];
                  const isAllocated = allocation && allocation.value > 0;
                  const isEntering =
                    enteringCell?.row === i && enteringCell?.col === j;
                  const isInLoop = loop?.some(
                    (cell) => cell.row === i && cell.col === j
                  );
                  const opportunityCost = opportunityCosts[i][j];

                  let cellClass = "relative border-2 p-2";
                  if (isEntering) {
                    cellClass += " bg-red-100 border-red-400";
                  } else if (isInLoop) {
                    cellClass += " bg-yellow-100 border-yellow-400";
                  } else if (isAllocated) {
                    cellClass += " bg-green-100 border-green-400";
                  } else {
                    cellClass += " border-gray-200";
                  }

                  return (
                    <TableCell key={j} className={cellClass}>
                      <div className="flex flex-col items-center space-y-1">
                        {/* Cost */}
                        <div className="text-xs font-medium">{cost}</div>

                        {/* Allocation */}
                        {isAllocated && (
                          <div className="text-sm font-bold text-green-800">
                            {allocation.value}
                          </div>
                        )}

                        {/* Opportunity Cost for non-basic variables */}
                        {!isAllocated && opportunityCost !== 0 && (
                          <div
                            className={`text-xs font-medium ${
                              opportunityCost < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            [{opportunityCost.toFixed(2)}]
                          </div>
                        )}

                        {/* Special markers */}
                        {isEntering && (
                          <Badge variant="destructive" className="text-xs">
                            Entering
                          </Badge>
                        )}
                        {isInLoop && !isEntering && (
                          <Badge variant="secondary" className="text-xs">
                            Loop
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center bg-blue-50 font-medium">
                  {problem.supply[i]}
                </TableCell>
              </TableRow>
            ))}

            {/* Demand Row */}
            <TableRow>
              <TableCell className="font-medium bg-gray-50">Demand</TableCell>
              {problem.demand.map((demand, j) => (
                <TableCell
                  key={j}
                  className="text-center bg-blue-50 font-medium"
                >
                  {demand}
                </TableCell>
              ))}
              <TableCell className="bg-blue-50"></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Loop Path Display */}
      {loop && loop.length > 0 && (
        <div className="p-3 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">
            Closed Loop Path:
          </h4>
          <div className="text-sm text-yellow-700">
            {loop.map((cell, index) => {
              const sign = index % 2 === 0 ? "+" : "-";
              return (
                <span key={index}>
                  {index > 0 && " → "}
                  <span
                    className={
                      index % 2 === 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {sign}({cell.row + 1},{cell.col + 1})
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
