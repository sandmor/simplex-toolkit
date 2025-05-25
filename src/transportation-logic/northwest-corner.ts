import {
  TransportationState,
  addAllocation,
  isAllocationComplete,
} from "./common";

export function performNorthwestCornerStep(
  state: TransportationState
): TransportationState {
  if (isAllocationComplete(state)) {
    return {
      ...state,
      status: "Complete",
      explanation:
        "Northwest Corner Method completed. All supply and demand satisfied.",
    };
  }

  const newState = { ...state };
  newState.remainingSupply = [...state.remainingSupply];
  newState.remainingDemand = [...state.remainingDemand];
  newState.allocations = [...state.allocations];
  newState.step += 1;

  // Find the northwest-most available cell
  let row = -1,
    col = -1;

  for (let i = 0; i < newState.remainingSupply.length; i++) {
    if (newState.remainingSupply[i] > 0) {
      for (let j = 0; j < newState.remainingDemand.length; j++) {
        if (newState.remainingDemand[j] > 0) {
          row = i;
          col = j;
          break;
        }
      }
      break;
    }
  }

  if (row === -1 || col === -1) {
    return {
      ...newState,
      status: "Complete",
      explanation: "No more allocations possible.",
    };
  }

  // Allocate minimum of supply and demand
  const allocation = Math.min(
    newState.remainingSupply[row],
    newState.remainingDemand[col]
  );
  const cost = newState.problem.costs[row][col];

  addAllocation(newState, row, col, allocation);

  newState.explanation =
    `Step ${newState.step}: Allocate ${allocation} units to cell (${newState.problem.supplyLabels[row]}, ${newState.problem.demandLabels[col]}) at cost ${cost}. ` +
    `Remaining supply[${row}]: ${newState.remainingSupply[row]}, Remaining demand[${col}]: ${newState.remainingDemand[col]}`;

  newState.status = isAllocationComplete(newState) ? "Complete" : "Running";

  return newState;
}

export function solveNorthwestCorner(
  state: TransportationState
): TransportationState[] {
  const steps: TransportationState[] = [state];
  let currentState = state;

  while (!isAllocationComplete(currentState) && steps.length < 100) {
    currentState = performNorthwestCornerStep(currentState);
    steps.push(currentState);

    if (currentState.status === "Complete") break;
  }

  return steps;
}
