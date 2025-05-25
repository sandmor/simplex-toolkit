import {
  TransportationState,
  addAllocation,
  isAllocationComplete,
} from "./common";

export function performLeastCostStep(
  state: TransportationState
): TransportationState {
  if (isAllocationComplete(state)) {
    return {
      ...state,
      status: "Complete",
      explanation:
        "Least Cost Method completed. All supply and demand satisfied.",
    };
  }

  const newState = { ...state };
  newState.remainingSupply = [...state.remainingSupply];
  newState.remainingDemand = [...state.remainingDemand];
  newState.allocations = [...state.allocations];
  newState.step += 1;

  // Find the cell with minimum cost among available cells
  let minCost = Infinity;
  let selectedRow = -1;
  let selectedCol = -1;

  for (let i = 0; i < newState.remainingSupply.length; i++) {
    if (newState.remainingSupply[i] > 0) {
      for (let j = 0; j < newState.remainingDemand.length; j++) {
        if (
          newState.remainingDemand[j] > 0 &&
          newState.problem.costs[i][j] < minCost
        ) {
          minCost = newState.problem.costs[i][j];
          selectedRow = i;
          selectedCol = j;
        }
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

  newState.explanation =
    `Step ${newState.step}: Selected cell (${newState.problem.supplyLabels[selectedRow]}, ${newState.problem.demandLabels[selectedCol]}) with minimum cost ${minCost}. ` +
    `Allocated ${allocation} units. Remaining supply[${selectedRow}]: ${newState.remainingSupply[selectedRow]}, Remaining demand[${selectedCol}]: ${newState.remainingDemand[selectedCol]}`;

  newState.status = isAllocationComplete(newState) ? "Complete" : "Running";

  return newState;
}

export function solveLeastCost(
  state: TransportationState
): TransportationState[] {
  const steps: TransportationState[] = [state];
  let currentState = state;

  while (!isAllocationComplete(currentState) && steps.length < 100) {
    currentState = performLeastCostStep(currentState);
    steps.push(currentState);

    if (currentState.status === "Complete") break;
  }

  return steps;
}
