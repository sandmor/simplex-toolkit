import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { TransportationProblem } from "../transportation-logic";

interface TransportationProblemDefinitionProps {
  onProblemSubmit: (problem: TransportationProblem) => void;
}

const defaultProblem: TransportationProblem = {
  supply: [20, 30, 25],
  demand: [15, 25, 35],
  costs: [
    [8, 6, 10],
    [9, 12, 13],
    [14, 9, 16],
  ],
  supplyLabels: ["S1", "S2", "S3"],
  demandLabels: ["D1", "D2", "D3"],
};

export default function TransportationProblemDefinition({
  onProblemSubmit,
}: TransportationProblemDefinitionProps) {
  const [problem, setProblem] = useState<TransportationProblem>(defaultProblem);
  const [numSuppliers, setNumSuppliers] = useState(3);
  const [numDemanders, setNumDemanders] = useState(3);

  const updateProblemSize = (suppliers: number, demanders: number) => {
    const newProblem: TransportationProblem = {
      supply: Array(suppliers)
        .fill(0)
        .map((_, i) => problem.supply[i] || 10),
      demand: Array(demanders)
        .fill(0)
        .map((_, i) => problem.demand[i] || 10),
      costs: Array(suppliers)
        .fill(0)
        .map((_, i) =>
          Array(demanders)
            .fill(0)
            .map((_, j) => problem.costs[i]?.[j] || 1)
        ),
      supplyLabels: Array(suppliers)
        .fill(0)
        .map((_, i) => `S${i + 1}`),
      demandLabels: Array(demanders)
        .fill(0)
        .map((_, i) => `D${i + 1}`),
    };
    setProblem(newProblem);
  };

  const updateSupply = (index: number, value: number) => {
    const newSupply = [...problem.supply];
    newSupply[index] = value;
    setProblem({ ...problem, supply: newSupply });
  };

  const updateDemand = (index: number, value: number) => {
    const newDemand = [...problem.demand];
    newDemand[index] = value;
    setProblem({ ...problem, demand: newDemand });
  };

  const updateCost = (row: number, col: number, value: number) => {
    const newCosts = problem.costs.map((r) => [...r]);
    newCosts[row][col] = value;
    setProblem({ ...problem, costs: newCosts });
  };

  const totalSupply = problem.supply.reduce((sum, s) => sum + s, 0);
  const totalDemand = problem.demand.reduce((sum, d) => sum + d, 0);
  const isBalanced = totalSupply === totalDemand;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Transportation Problem Definition</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define your transportation problem by setting supply, demand, and cost
          matrix.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="suppliers">Suppliers:</Label>
            <select
              id="suppliers"
              value={numSuppliers}
              onChange={(e) => {
                const newNum = parseInt(e.target.value);
                setNumSuppliers(newNum);
                updateProblemSize(newNum, numDemanders);
              }}
              className="px-2 py-1 border rounded"
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="demanders">Demanders:</Label>
            <select
              id="demanders"
              value={numDemanders}
              onChange={(e) => {
                const newNum = parseInt(e.target.value);
                setNumDemanders(newNum);
                updateProblemSize(numSuppliers, newNum);
              }}
              className="px-2 py-1 border rounded"
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-50">
                  From\\To
                </th>
                {problem.demandLabels.map((label, i) => (
                  <th key={i} className="border border-gray-300 p-2 bg-gray-50">
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
                  {problem.demandLabels.map((_, j) => (
                    <td key={j} className="border border-gray-300 p-1">
                      <input
                        type="number"
                        min="0"
                        value={problem.costs[i][j]}
                        onChange={(e) =>
                          updateCost(i, j, parseInt(e.target.value) || 0)
                        }
                        className="w-full p-1 text-center border rounded"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 p-1 bg-blue-50">
                    <input
                      type="number"
                      min="0"
                      value={problem.supply[i]}
                      onChange={(e) =>
                        updateSupply(i, parseInt(e.target.value) || 0)
                      }
                      className="w-full p-1 text-center border rounded bg-blue-50"
                    />
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
                    className="border border-gray-300 p-1 bg-green-50"
                  >
                    <input
                      type="number"
                      min="0"
                      value={demand}
                      onChange={(e) =>
                        updateDemand(j, parseInt(e.target.value) || 0)
                      }
                      className="w-full p-1 text-center border rounded bg-green-50"
                    />
                  </td>
                ))}
                <td className="border border-gray-300 p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className={`p-3 rounded ${
            isBalanced
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          <p className="text-sm">
            Total Supply: {totalSupply} | Total Demand: {totalDemand}
            {isBalanced
              ? " ✓ Balanced"
              : " ⚠ Unbalanced (will be automatically balanced)"}
          </p>
        </div>

        <Button
          onClick={() => onProblemSubmit(problem)}
          className="w-full"
          size="lg"
        >
          Solve Transportation Problem
        </Button>
      </CardContent>
    </Card>
  );
}
