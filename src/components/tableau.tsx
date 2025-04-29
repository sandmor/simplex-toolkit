import { Badge } from "./ui/badge";
import { MNumber } from "../simplex-logic/m-number";
import { SimplexState } from "../simplex-logic/big-m";
import { calculatePivotInfo } from "../simplex-logic/pivot-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import React from "react";
import { formatVar } from "@/lib/utils";

// Helper to format numbers and MNumbers
const formatValue = (val: MNumber | number | string): string => {
  if (val instanceof MNumber) {
    // Check if it's our custom MNumber object
    return val.toString();
  }
  if (typeof val === "number") {
    // Basic formatting for floats
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
  }
  return val.toString(); // Return as is for strings like variable names
};

interface TableauProps {
  state: SimplexState;
  showDual: boolean;
  editing?: boolean;
  onStateChange?: (state: SimplexState) => void;
}

function Tableau({
  state,
  showDual,
  editing = false,
  onStateChange,
}: TableauProps) {
  const {
    cj,
    variables,
    basis,
    cb,
    rhs,
    tableau,
    zj_cj,
    objectiveValue,
    useBigM,
  } = state;

  // Handlers for editing
  const handleRhsChange =
    (row: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onStateChange) return;
      const newRhs = rhs.map((val, i) =>
        i === row ? parseFloat(e.target.value) || 0 : val,
      );
      onStateChange({ ...state, rhs: newRhs });
    };

  const handleCellChange =
    (row: number, col: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onStateChange) return;
      const newTableau = tableau.map((r, i) =>
        r.map((val, j) =>
          i === row && j === col ? parseFloat(e.target.value) || 0 : val,
        ),
      );
      onStateChange({ ...state, tableau: newTableau });
    };

  // Calculate Z value string representation
  const zValueStr =
    objectiveValue instanceof MNumber
      ? objectiveValue.toString()
      : formatValue(objectiveValue);

  // Calculate pivot information for highlighting and educational purposes
  const pivotInfo = calculatePivotInfo(state);
  const { enteringVarIndex, leavingRowIndex, ratios } = pivotInfo;

  return (
    <div className="rounded-md border my-6">
      {/* Mode badges */}
      <div className="p-2 flex gap-2 items-center">
        <Badge variant={useBigM ? "destructive" : "secondary"}>
          {useBigM ? "Big M Method" : "Standard Simplex"}
        </Badge>
        <Badge variant="default">{showDual ? "Dual" : "Primal"}</Badge>
      </div>
      <Table>
        <TableHeader>
          {/* Cj Row */}
          <TableRow>
            <TableHead className="w-[80px]"></TableHead>
            {/* CB */}
            <TableHead className="w-[80px]">Basis</TableHead>
            <TableHead className="w-[80px]">RHS</TableHead>
            {variables.map((v: string, index: number) => (
              <TableHead
                key={v}
                className={
                  enteringVarIndex === index
                    ? "bg-blue-100 dark:bg-blue-900"
                    : ""
                }
              >
                <>
                  {`(${formatValue(cj[index])}) `}
                  {formatVar(v)}
                </>
                {enteringVarIndex === index && (
                  <div className="text-xs mt-1 font-normal">(entering)</div>
                )}
              </TableHead>
            ))}
            {/* Ratio Column Header - only show if we're selecting a pivot */}
            {enteringVarIndex !== null && (
              <TableHead className="w-[100px] text-xs text-center">
                Ratio
                <br />
                (RHS/Coeff)
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Constraint Rows */}
          {basis.map((bv: string, i: number) => (
            <TableRow
              key={`row-${i}`}
              className={
                i === pivotInfo.leavingRowIndex
                  ? "bg-yellow-50 dark:bg-yellow-900/20"
                  : ""
              }
            >
              <TableCell className="font-medium">
                {formatValue(cb[i])}
              </TableCell>
              <TableCell>{formatVar(bv)}</TableCell>
              <TableCell>
                {editing ? (
                  <input
                    type="number"
                    value={rhs[i]}
                    onChange={handleRhsChange(i)}
                    className="w-full border rounded"
                  />
                ) : (
                  formatValue(rhs[i])
                )}
              </TableCell>
              {tableau[i].map((val: number, j: number) => (
                <TableCell
                  key={`cell-${i}-${j}`}
                  className={
                    i === pivotInfo.leavingRowIndex &&
                    j === pivotInfo.enteringVarIndex
                      ? "bg-green-200 dark:bg-green-800 font-bold"
                      : ""
                  }
                >
                  {editing ? (
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={handleCellChange(i, j)}
                      className="w-full border rounded"
                    />
                  ) : (
                    formatValue(val)
                  )}
                </TableCell>
              ))}
              {/* Ratio Column */}
              {enteringVarIndex !== null && (
                <TableCell
                  className={`text-right ${
                    i === leavingRowIndex
                      ? "font-bold text-green-600 dark:text-green-400"
                      : ""
                  }`}
                >
                  {ratios[i] !== null ? ratios[i]?.toFixed(2) : "-"}
                  {i === leavingRowIndex && ratios[i] !== null && (
                    <div className="text-xs mt-1 text-center">(min)</div>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {/* Zj - Cj Row */}
          <TableRow className="bg-muted">
            <TableCell></TableCell>
            <TableCell className="font-medium">Zj - Cj</TableCell>
            <TableCell className="font-medium">{`Z = ${zValueStr}`}</TableCell>
            {zj_cj.map((val: MNumber, j: number) => (
              <TableCell
                key={`zj-cj-${j}`}
                className={`font-medium ${
                  enteringVarIndex === j ? "bg-blue-100 dark:bg-blue-900" : ""
                }`}
              >
                {formatValue(val)}
              </TableCell>
            ))}
            {/* Empty cell for ratio column */}
            {enteringVarIndex !== null && <TableCell></TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export default Tableau;
