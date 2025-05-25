import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AssignmentProblem } from "../assignment-logic";

interface AssignmentProblemDefinitionProps {
  onProblemSubmit: (problem: AssignmentProblem) => void;
}

export default function AssignmentProblemDefinition({
  onProblemSubmit,
}: AssignmentProblemDefinitionProps) {
  const [size, setSize] = useState<number>(3);
  const [costs, setCosts] = useState<number[][]>(
    Array.from({ length: 3 }, () => Array(3).fill(0))
  );
  const [rowLabels, setRowLabels] = useState<string[]>([
    "Worker 1",
    "Worker 2",
    "Worker 3",
  ]);
  const [colLabels, setColLabels] = useState<string[]>([
    "Task A",
    "Task B",
    "Task C",
  ]);
  const [isMaximization, setIsMaximization] = useState<boolean>(false);

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);

    // Resize cost matrix
    const newCosts = Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) =>
        costs[i] && costs[i][j] !== undefined ? costs[i][j] : 0
      )
    );
    setCosts(newCosts);

    // Resize labels
    const newRowLabels = Array.from(
      { length: newSize },
      (_, i) => rowLabels[i] || `Worker ${i + 1}`
    );
    const newColLabels = Array.from(
      { length: newSize },
      (_, i) => colLabels[i] || `Task ${String.fromCharCode(65 + i)}`
    );
    setRowLabels(newRowLabels);
    setColLabels(newColLabels);
  };

  const handleCostChange = (row: number, col: number, value: string) => {
    const newCosts = [...costs];
    newCosts[row] = [...newCosts[row]];
    newCosts[row][col] = parseFloat(value) || 0;
    setCosts(newCosts);
  };

  const handleRowLabelChange = (index: number, value: string) => {
    const newLabels = [...rowLabels];
    newLabels[index] = value;
    setRowLabels(newLabels);
  };

  const handleColLabelChange = (index: number, value: string) => {
    const newLabels = [...colLabels];
    newLabels[index] = value;
    setColLabels(newLabels);
  };

  const handleSubmit = () => {
    const problem: AssignmentProblem = {
      costs,
      rowLabels,
      colLabels,
      isMaximization,
    };
    onProblemSubmit(problem);
  };

  const loadExample = () => {
    setSize(3);
    setCosts([
      [9, 2, 7],
      [6, 4, 3],
      [5, 8, 1],
    ]);
    setRowLabels(["Worker 1", "Worker 2", "Worker 3"]);
    setColLabels(["Task A", "Task B", "Task C"]);
    setIsMaximization(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">🎯 Define Assignment Problem</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a square cost matrix where each cell represents the cost (or
          benefit) of assigning a worker to a task.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Problem Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Matrix Size:</label>
            <select
              value={size}
              onChange={(e) => handleSizeChange(parseInt(e.target.value))}
              className="px-3 py-1 border rounded"
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}×{n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Objective:</label>
            <select
              value={isMaximization ? "max" : "min"}
              onChange={(e) => setIsMaximization(e.target.value === "max")}
              className="px-3 py-1 border rounded"
            >
              <option value="min">Minimize Cost</option>
              <option value="max">Maximize Benefit</option>
            </select>
          </div>

          <Button variant="outline" onClick={loadExample}>
            Load Example
          </Button>
        </div>

        {/* Cost Matrix */}
        <div className="space-y-4">
          <h3 className="font-semibold">
            {isMaximization ? "Benefit" : "Cost"} Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-50"></th>
                  {colLabels.map((label, j) => (
                    <th
                      key={j}
                      className="border border-gray-300 p-2 bg-gray-50"
                    >
                      <input
                        type="text"
                        value={label}
                        onChange={(e) =>
                          handleColLabelChange(j, e.target.value)
                        }
                        className="w-20 text-center text-sm border-none bg-transparent"
                        placeholder={`Task ${String.fromCharCode(65 + j)}`}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costs.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                      <input
                        type="text"
                        value={rowLabels[i]}
                        onChange={(e) =>
                          handleRowLabelChange(i, e.target.value)
                        }
                        className="w-20 text-center text-sm border-none bg-transparent"
                        placeholder={`Worker ${i + 1}`}
                      />
                    </td>
                    {row.map((cost, j) => (
                      <td key={j} className="border border-gray-300 p-1">
                        <input
                          type="number"
                          value={cost}
                          onChange={(e) =>
                            handleCostChange(i, j, e.target.value)
                          }
                          className="w-16 text-center border rounded px-2 py-1"
                          step="0.1"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleSubmit} className="px-8 py-2">
            🚀 Solve Assignment Problem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
