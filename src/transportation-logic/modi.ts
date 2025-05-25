import { TransportationState, Allocation, MODIData } from "./types";
import { calculateTotalCost } from "./common";

export function initializeMODI(
  state: TransportationState
): TransportationState {
  const { problem } = state;
  const m = problem.supply.length;
  const n = problem.demand.length;

  // Initialize U and V values
  const uValues: (number | undefined)[] = new Array(m).fill(undefined);
  const vValues: (number | undefined)[] = new Array(n).fill(undefined);

  // Set u[0] = 0 as starting point
  uValues[0] = 0;

  // Calculate initial opportunity costs
  const opportunityCosts = Array.from({ length: m }, () =>
    new Array(n).fill(0)
  );

  const modiData: MODIData = {
    uValues,
    vValues,
    opportunityCosts,
    mostNegativeCell: null,
    enteringCell: null,
    exitingCell: null,
    loop: null,
    theta: null,
  };

  return {
    ...state,
    method: "MODI",
    step: 1,
    status: "Running",
    explanation:
      "MODI (Modified Distribution) Method initialized. Starting with u₁ = 0 and calculating dual variables.",
    modiData,
  };
}

export function calculateDualVariables(
  state: TransportationState
): TransportationState {
  if (!state.modiData) throw new Error("MODI data not initialized");

  const { problem, allocations } = state;
  const { uValues, vValues } = state.modiData;
  const m = problem.supply.length;
  const n = problem.demand.length;

  // Create a copy of u and v values
  const newUValues = [...uValues];
  const newVValues = [...vValues];

  // Continue iterating until all u and v values are calculated
  let changed = true;
  let iterations = 0;
  const maxIterations = m + n;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // For each basic variable (allocation), use ui + vj = cij
    for (const allocation of allocations) {
      if (allocation.value > 0) {
        const { row, col } = allocation;
        const cost = problem.costs[row][col];

        // If ui is known and vj is unknown
        if (newUValues[row] !== undefined && newVValues[col] === undefined) {
          newVValues[col] = cost - newUValues[row]!;
          changed = true;
        }
        // If vj is known and ui is unknown
        else if (
          newVValues[col] !== undefined &&
          newUValues[row] === undefined
        ) {
          newUValues[row] = cost - newVValues[col]!;
          changed = true;
        }
      }
    }
  }

  // Check if all values are calculated
  const allCalculated =
    newUValues.every((u) => u !== undefined) &&
    newVValues.every((v) => v !== undefined);

  const explanation = allCalculated
    ? `Dual variables calculated: u = [${newUValues
        .map((u) => u?.toFixed(1) || "?")
        .join(", ")}], v = [${newVValues
        .map((v) => v?.toFixed(1) || "?")
        .join(", ")}]`
    : `Calculating dual variables... Current: u = [${newUValues
        .map((u) => u?.toFixed(1) || "?")
        .join(", ")}], v = [${newVValues
        .map((v) => v?.toFixed(1) || "?")
        .join(", ")}]`;

  return {
    ...state,
    step: state.step + 1,
    explanation,
    modiData: {
      ...state.modiData,
      uValues: newUValues,
      vValues: newVValues,
    },
  };
}

export function calculateOpportunityCosts(
  state: TransportationState
): TransportationState {
  if (!state.modiData) throw new Error("MODI data not initialized");

  const { problem } = state;
  const { uValues, vValues } = state.modiData;
  const m = problem.supply.length;
  const n = problem.demand.length;

  // Calculate opportunity costs for all non-basic variables
  const opportunityCosts = Array.from({ length: m }, () =>
    new Array(n).fill(0)
  );
  let mostNegative = { row: -1, col: -1, value: 0 };
  let hasNegative = false;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      // Check if this cell is non-basic (no allocation)
      const allocation = state.allocations.find(
        (a) => a.row === i && a.col === j
      );
      const isBasic = allocation && allocation.value > 0;

      if (!isBasic) {
        // Calculate opportunity cost: cij - (ui + vj)
        const ui = uValues[i] ?? 0;
        const vj = vValues[j] ?? 0;
        const opportunityCost = problem.costs[i][j] - (ui + vj);
        opportunityCosts[i][j] = opportunityCost;

        // Track most negative opportunity cost
        if (opportunityCost < mostNegative.value) {
          mostNegative = { row: i, col: j, value: opportunityCost };
          hasNegative = true;
        }
      }
    }
  }

  const explanation = hasNegative
    ? `Opportunity costs calculated. Most negative: (${mostNegative.row + 1}, ${
        mostNegative.col + 1
      }) = ${mostNegative.value.toFixed(2)}. Solution is not optimal.`
    : "All opportunity costs are non-negative. Current solution is optimal!";

  return {
    ...state,
    step: state.step + 1,
    explanation,
    isOptimal: !hasNegative,
    modiData: {
      ...state.modiData,
      opportunityCosts,
      mostNegativeCell: hasNegative ? mostNegative : null,
    },
  };
}

export function findEnteringVariable(
  state: TransportationState
): TransportationState {
  if (!state.modiData?.mostNegativeCell) {
    return {
      ...state,
      explanation: "No entering variable needed - solution is optimal.",
      status: "Complete",
    };
  }

  const { row, col } = state.modiData.mostNegativeCell;

  return {
    ...state,
    step: state.step + 1,
    explanation: `Entering variable: x₍${row + 1},${
      col + 1
    }₎ with opportunity cost ${state.modiData.mostNegativeCell.value.toFixed(
      2
    )}`,
    modiData: {
      ...state.modiData,
      enteringCell: { row, col },
    },
  };
}

export function findClosedLoop(
  state: TransportationState
): TransportationState {
  if (!state.modiData?.enteringCell)
    throw new Error("No entering cell defined");

  const { problem, allocations } = state;
  const { enteringCell } = state.modiData;

  // Find a closed loop starting and ending at the entering cell
  const loop = findLoop(
    enteringCell,
    allocations,
    problem.supply.length,
    problem.demand.length
  );

  if (!loop) {
    return {
      ...state,
      explanation:
        "Error: Could not find a closed loop. The problem may be degenerate.",
      status: "Complete",
    };
  }

  const loopStr = loop
    .map((cell, index) => {
      const sign = index % 2 === 0 ? "+" : "-";
      return `${sign}(${cell.row + 1},${cell.col + 1})`;
    })
    .join(" → ");

  return {
    ...state,
    step: state.step + 1,
    explanation: `Closed loop found: ${loopStr}`,
    modiData: {
      ...state.modiData,
      loop,
    },
  };
}

export function calculateTheta(
  state: TransportationState
): TransportationState {
  if (!state.modiData?.loop) throw new Error("No loop defined");

  const { allocations } = state;
  const { loop } = state.modiData;

  // Find the minimum allocation among cells with negative signs (odd indices)
  let theta = Infinity;
  let exitingCell: { row: number; col: number } | null = null;

  for (let i = 1; i < loop.length; i += 2) {
    // Odd indices have negative signs
    const cell = loop[i];
    const allocation = allocations.find(
      (a) => a.row === cell.row && a.col === cell.col
    );
    const value = allocation?.value || 0;

    if (value < theta) {
      theta = value;
      exitingCell = cell;
    }
  }

  const explanation = exitingCell
    ? `θ = ${theta} (minimum value in negative cells). Exiting variable: x₍${
        exitingCell.row + 1
      },${exitingCell.col + 1}₎`
    : "Could not determine theta value.";

  return {
    ...state,
    step: state.step + 1,
    explanation,
    modiData: {
      ...state.modiData,
      theta,
      exitingCell,
    },
  };
}

export function updateAllocation(
  state: TransportationState
): TransportationState {
  if (!state.modiData?.loop || !state.modiData?.theta) {
    throw new Error("Missing loop or theta data");
  }

  const { allocations } = state;
  const { loop, theta } = state.modiData;

  // Create new allocations array
  const newAllocations = [...allocations];

  // Update allocations along the loop
  for (let i = 0; i < loop.length; i++) {
    const cell = loop[i];
    const isPositive = i % 2 === 0;
    const change = isPositive ? theta : -theta;

    // Find or create allocation for this cell
    const allocationIndex = newAllocations.findIndex(
      (a) => a.row === cell.row && a.col === cell.col
    );

    if (allocationIndex >= 0) {
      newAllocations[allocationIndex].value += change;
      // Remove allocations that become zero
      if (newAllocations[allocationIndex].value <= 0.0001) {
        newAllocations.splice(allocationIndex, 1);
      }
    } else if (isPositive) {
      // Add new allocation for positive cells
      newAllocations.push({ row: cell.row, col: cell.col, value: change });
    }
  }

  const newTotalCost = calculateTotalCost(newAllocations, state.problem.costs);

  return {
    ...state,
    step: state.step + 1,
    allocations: newAllocations,
    totalCost: newTotalCost,
    explanation: `Allocations updated using θ = ${theta}. New total cost: ${newTotalCost.toFixed(
      2
    )}`,
    modiData: {
      ...state.modiData,
      enteringCell: null,
      exitingCell: null,
      loop: null,
      theta: null,
      mostNegativeCell: null,
    },
  };
}

function findLoop(
  startCell: { row: number; col: number },
  allocations: Allocation[],
  rows: number,
  cols: number
): { row: number; col: number }[] | null {
  // Create basic variable matrix
  const basicCells = new Set<string>();
  for (const allocation of allocations) {
    if (allocation.value > 0) {
      basicCells.add(`${allocation.row},${allocation.col}`);
    }
  }

  // Try to find a path using DFS
  const visited = new Set<string>();
  const path: { row: number; col: number }[] = [startCell];

  function dfs(current: { row: number; col: number }, depth: number): boolean {
    if (
      depth > 0 &&
      current.row === startCell.row &&
      current.col === startCell.col
    ) {
      return true; // Found loop back to start
    }

    if (depth >= rows + cols) return false; // Prevent infinite loops

    const currentKey = `${current.row},${current.col}`;

    // Try horizontal moves (same row, different columns)
    for (let col = 0; col < cols; col++) {
      if (col !== current.col) {
        const nextKey = `${current.row},${col}`;
        if (
          (basicCells.has(nextKey) ||
            (current.row === startCell.row && col === startCell.col)) &&
          !visited.has(nextKey)
        ) {
          visited.add(currentKey);
          path.push({ row: current.row, col });
          if (dfs({ row: current.row, col }, depth + 1)) {
            return true;
          }
          path.pop();
          visited.delete(currentKey);
        }
      }
    }

    // Try vertical moves (same column, different rows)
    for (let row = 0; row < rows; row++) {
      if (row !== current.row) {
        const nextKey = `${row},${current.col}`;
        if (
          (basicCells.has(nextKey) ||
            (row === startCell.row && current.col === startCell.col)) &&
          !visited.has(nextKey)
        ) {
          visited.add(currentKey);
          path.push({ row, col: current.col });
          if (dfs({ row, col: current.col }, depth + 1)) {
            return true;
          }
          path.pop();
          visited.delete(currentKey);
        }
      }
    }

    return false;
  }

  if (dfs(startCell, 0)) {
    return path;
  }

  return null;
}

export function performMODIStep(
  state: TransportationState
): TransportationState {
  if (state.status === "Complete") {
    return state;
  }

  // Initialize MODI if not already done
  if (!state.modiData) {
    return initializeMODI(state);
  }

  const { modiData } = state;

  // Step 1: Calculate dual variables if not complete
  if (
    modiData.uValues.some((u) => u === undefined) ||
    modiData.vValues.some((v) => v === undefined)
  ) {
    return calculateDualVariables(state);
  }

  // Step 2: Calculate opportunity costs if not done
  if (state.isOptimal === undefined) {
    return calculateOpportunityCosts(state);
  }

  // If optimal, we're done
  if (state.isOptimal === true) {
    return {
      ...state,
      status: "Complete",
      explanation: "MODI optimization complete - solution is optimal!",
    };
  }

  // If not optimal but isOptimal is set to false, we need to proceed with improvement
  // Step 3: Find entering variable if not done
  if (!modiData.enteringCell) {
    return findEnteringVariable(state);
  }

  // Step 4: Find closed loop if not done
  if (!modiData.loop) {
    return findClosedLoop(state);
  }

  // Step 5: Calculate theta if not done
  if (modiData.theta === null) {
    return calculateTheta(state);
  }

  // Step 6: Update allocation and start a new iteration
  const updatedState = updateAllocation(state);

  // Reset MODI data for next iteration but keep the method
  // Don't reset isOptimal here since we need to recalculate in the next iteration
  return {
    ...updatedState,
    modiData: {
      uValues: new Array(updatedState.problem.supply.length).fill(undefined),
      vValues: new Array(updatedState.problem.demand.length).fill(undefined),
      opportunityCosts: [],
      mostNegativeCell: null,
      enteringCell: null,
      exitingCell: null,
      loop: null,
      theta: null,
    },
    isOptimal: undefined, // Reset to trigger recalculation
    explanation:
      "Allocation updated. Starting new MODI iteration to check optimality...",
  };
}

export function solveMODI(state: TransportationState): TransportationState[] {
  const steps: TransportationState[] = [state];
  let currentState = state;
  let maxSteps = 100; // Prevent infinite loops

  while (currentState.status !== "Complete" && maxSteps > 0) {
    currentState = performMODIStep(currentState);
    steps.push(currentState);
    maxSteps--;
  }

  return steps;
}
