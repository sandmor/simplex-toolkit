import {
  TransportationState,
  addAllocation,
  isAllocationComplete,
} from "./common";
import { VAMPenalty } from "./types";

function calculateRowPenalty(
  costs: number[][],
  rowIndex: number,
  availableCols: boolean[]
): number {
  const availableCosts = costs[rowIndex]
    .map((cost, colIndex) => (availableCols[colIndex] ? cost : Infinity))
    .filter((cost) => cost !== Infinity)
    .sort((a, b) => a - b);

  if (availableCosts.length < 2) return 0;
  return availableCosts[1] - availableCosts[0];
}

function calculateColPenalty(
  costs: number[][],
  colIndex: number,
  availableRows: boolean[]
): number {
  const availableCosts = costs
    .map((row, rowIndex) =>
      availableRows[rowIndex] ? row[colIndex] : Infinity
    )
    .filter((cost) => cost !== Infinity)
    .sort((a, b) => a - b);

  if (availableCosts.length < 2) return 0;
  return availableCosts[1] - availableCosts[0];
}

function calculateAllPenalties(state: TransportationState): VAMPenalty[] {
  const penalties: VAMPenalty[] = [];
  const availableRows = state.remainingSupply.map(
    (supply: number) => supply > 0
  );
  const availableCols = state.remainingDemand.map(
    (demand: number) => demand > 0
  );

  // Calculate row penalties
  for (let i = 0; i < state.problem.supply.length; i++) {
    if (availableRows[i]) {
      const penalty = calculateRowPenalty(
        state.problem.costs,
        i,
        availableCols
      );
      const minCosts = state.problem.costs[i]
        .map((cost: number, colIndex: number) =>
          availableCols[colIndex] ? cost : Infinity
        )
        .filter((cost: number) => cost !== Infinity);

      penalties.push({
        type: "row",
        index: i,
        penalty,
        minCosts: minCosts.sort((a: number, b: number) => a - b),
      });
    }
  }

  // Calculate column penalties
  for (let j = 0; j < state.problem.demand.length; j++) {
    if (availableCols[j]) {
      const penalty = calculateColPenalty(
        state.problem.costs,
        j,
        availableRows
      );
      const minCosts = state.problem.costs
        .map((row: number[], rowIndex: number) =>
          availableRows[rowIndex] ? row[j] : Infinity
        )
        .filter((cost: number) => cost !== Infinity);

      penalties.push({
        type: "col",
        index: j,
        penalty,
        minCosts: minCosts.sort((a: number, b: number) => a - b),
      });
    }
  }

  return penalties.sort((a, b) => b.penalty - a.penalty);
}

export function performVAMStep(
  state: TransportationState
): TransportationState {
  if (isAllocationComplete(state)) {
    return {
      ...state,
      status: "Complete",
      explanation:
        "Vogel's Approximation Method completed. All supply and demand satisfied.",
    };
  }

  const newState = { ...state };
  newState.remainingSupply = [...state.remainingSupply];
  newState.remainingDemand = [...state.remainingDemand];
  newState.allocations = [...state.allocations];
  newState.step += 1;

  // Calculate all penalties
  const penalties = calculateAllPenalties(newState);

  if (penalties.length === 0) {
    return {
      ...newState,
      status: "Complete",
      explanation: "No more allocations possible.",
    };
  }

  // Select the row/column with highest penalty
  const highestPenalty = penalties[0];
  let selectedRow = -1;
  let selectedCol = -1;
  let minCost = Infinity;

  if (highestPenalty.type === "row") {
    // Find minimum cost cell in the selected row
    selectedRow = highestPenalty.index;
    for (let j = 0; j < newState.remainingDemand.length; j++) {
      if (
        newState.remainingDemand[j] > 0 &&
        newState.problem.costs[selectedRow][j] < minCost
      ) {
        minCost = newState.problem.costs[selectedRow][j];
        selectedCol = j;
      }
    }
  } else {
    // Find minimum cost cell in the selected column
    selectedCol = highestPenalty.index;
    for (let i = 0; i < newState.remainingSupply.length; i++) {
      if (
        newState.remainingSupply[i] > 0 &&
        newState.problem.costs[i][selectedCol] < minCost
      ) {
        minCost = newState.problem.costs[i][selectedCol];
        selectedRow = i;
      }
    }
  }

  if (selectedRow === -1 || selectedCol === -1) {
    return {
      ...newState,
      status: "Complete",
      explanation: "No more allocations possible.",
    };
  }

  // Allocate minimum of supply and demand
  const allocation = Math.min(
    newState.remainingSupply[selectedRow],
    newState.remainingDemand[selectedCol]
  );

  addAllocation(newState, selectedRow, selectedCol, allocation);

  const penaltyType = highestPenalty.type === "row" ? "row" : "column";
  const penaltyIndex =
    highestPenalty.type === "row"
      ? newState.problem.supplyLabels[highestPenalty.index]
      : newState.problem.demandLabels[highestPenalty.index];

  newState.explanation =
    `Step ${newState.step}: Highest penalty (${highestPenalty.penalty}) in ${penaltyType} ${penaltyIndex}. ` +
    `Selected cell (${newState.problem.supplyLabels[selectedRow]}, ${newState.problem.demandLabels[selectedCol]}) with cost ${minCost}. ` +
    `Allocated ${allocation} units. Remaining supply[${selectedRow}]: ${newState.remainingSupply[selectedRow]}, Remaining demand[${selectedCol}]: ${newState.remainingDemand[selectedCol]}`;

  newState.status = isAllocationComplete(newState) ? "Complete" : "Running";

  return newState;
}

export function solveVAM(state: TransportationState): TransportationState[] {
  const steps: TransportationState[] = [state];
  let currentState = state;

  while (!isAllocationComplete(currentState) && steps.length < 100) {
    currentState = performVAMStep(currentState);
    steps.push(currentState);

    if (currentState.status === "Complete") break;
  }

  return steps;
}
