import { MNumber } from "./m-number";

const M_PENALTY = 1; // Use 1 for M coefficient, comparison logic handles 'largeness'

// Define TypeScript interfaces for our data structures
export interface Objective {
  coefficients: number[];
  variables: string[];
}

export interface Constraint {
  coefficients: number[];
  variables: string[];
  type: ">=" | "<=" | "=";
  rhs: number;
}

export interface SimplexState {
  cj: MNumber[];
  variables: string[];
  basis: string[];
  cb: MNumber[];
  rhs: number[];
  isMaximization: boolean;
  tableau: number[][];
  zj_cj: MNumber[];
  objectiveValue: MNumber;
  status: "Initial" | "Running" | "Optimal" | "Infeasible" | "Unbounded";
  explanation: string;
  useBigM: boolean;
  formulation: string;
}

export function initializeProblem(
  objective: Objective,
  constraints: Constraint[],
  isMaximization = false,
): SimplexState {
  // Exclude explicit non-negativity constraints (x >= 0 with rhs=0)
  const relevantConstraints = constraints.filter(
    (c) => !(c.type === ">=" && c.rhs === 0),
  );

  // Determine if standard simplex applies (maximization with all <= constraints)
  const standardSimplex =
    isMaximization &&
    relevantConstraints.length > 0 &&
    relevantConstraints.every((c) => c.type === "<=");

  // Original variable names
  const origVars = [...objective.variables];
  const origCoeffs = [...objective.coefficients];

  const variables: string[] = [...origVars];
  const cj: MNumber[] = origCoeffs.map((c) => new MNumber(c));
  const basis: string[] = [];
  const cb: MNumber[] = [];
  const tableau: number[][] = [];
  const rhs: number[] = [];

  let useBigM: boolean;

  if (standardSimplex) {
    // Standard simplex: add one slack var per constraint
    relevantConstraints.forEach((_, i) => {
      const slackName = `s${i + 1}`;
      variables.push(slackName);
      cj.push(new MNumber(0));
      basis.push(slackName);
      cb.push(new MNumber(0));
    });
    // Build tableau and RHS
    relevantConstraints.forEach((con, i) => {
      // initialize row with full width of variables (including slack)
      const row = Array(variables.length).fill(0);
      con.coefficients.forEach((coef, j) => (row[j] = coef));
      // slack column at index origVars.length + i
      row[origVars.length + i] = 1;
      tableau.push(row);
      rhs.push(con.rhs);
    });
    useBigM = false;
  } else {
    // Big M method: dynamic slack, surplus, artificial
    const M_P = M_PENALTY;
    let colIndex = variables.length;
    // Maps for new var positions
    const slackPositions: number[] = [];
    const surplusPositions: number[] = [];
    const artificialPositions: number[] = [];

    // First pass: assign columns and update variables & cj
    relevantConstraints.forEach((con, i) => {
      if (con.type === "<=") {
        const name = `s${i + 1}`;
        variables.push(name);
        cj.push(new MNumber(0));
        slackPositions[i] = colIndex++;
      } else if (con.type === ">=") {
        const sName = `s${i + 1}`;
        variables.push(sName);
        cj.push(new MNumber(0));
        surplusPositions[i] = colIndex++;
        const aName = `a${i + 1}`;
        variables.push(aName);
        // penalty +M for minimization, -M for maximization
        const mCoeff = isMaximization ? -M_P : M_P;
        cj.push(new MNumber(0, mCoeff));
        artificialPositions[i] = colIndex++;
      } else {
        // '='
        const aName = `a${i + 1}`;
        variables.push(aName);
        const mCoeff = isMaximization ? -M_P : M_P;
        cj.push(new MNumber(0, mCoeff));
        artificialPositions[i] = colIndex++;
      }
    });

    // Initialize basis and cb
    relevantConstraints.forEach((con, i) => {
      if (con.type === "<=") {
        const name = `s${i + 1}`;
        basis.push(name);
        cb.push(new MNumber(0));
      } else {
        // basis is artificial for >= and =
        const name = `a${i + 1}`;
        basis.push(name);
        const mCoeff = isMaximization ? -M_P : M_P;
        cb.push(new MNumber(0, mCoeff));
      }
    });

    // Build rows
    relevantConstraints.forEach((con, i) => {
      const row = Array(variables.length).fill(0);
      // original coefficients
      con.coefficients.forEach((coef, j) => (row[j] = coef));
      // slack/surplus/artificial
      if (con.type === "<=") {
        row[slackPositions[i]] = 1;
      } else if (con.type === ">=") {
        row[surplusPositions[i]] = -1;
        row[artificialPositions[i]] = 1;
      } else {
        row[artificialPositions[i]] = 1;
      }
      tableau.push(row);
      rhs.push(con.rhs);
    });
    useBigM = true;
  }

  // Build human-readable formulation
  const formulationLines: string[] = [];
  // Helper to format variable names with subscript HTML
  const formatVarHtml = (v: string) => {
    const match = v.match(/^([a-zA-Z]+)(\d+)$/);
    if (match) return `${match[1]}<sub>${match[2]}</sub>`;
    return v;
  };
  // Helpers: format terms and join with proper signs
  const formatMTerm = (coef: MNumber, v: string) => {
    const s = coef.toString();
    if (s === "0") return null;
    const varHtml = formatVarHtml(v);
    if (s === "1") return varHtml;
    if (s === "-1") return `-${varHtml}`;
    return `${s}${varHtml}`;
  };
  const formatNTerm = (coef: number, v: string) => {
    if (coef === 0) return null;
    const varHtml = formatVarHtml(v);
    if (coef === 1) return varHtml;
    if (coef === -1) return `-${varHtml}`;
    return `${coef}${varHtml}`;
  };
  const joinTerms = (terms: string[]) => {
    if (terms.length === 0) return "0";
    return terms.reduce((acc, t) => {
      if (t.startsWith("-")) return acc + " - " + t.slice(1);
      return acc ? acc + " + " + t : t;
    }, "");
  };
  // Objective formulation
  const objTermsArr: string[] = [];
  cj.forEach((coef, i) => {
    const term = formatMTerm(coef, variables[i]);
    if (term) objTermsArr.push(term);
  });
  formulationLines.push(
    `${isMaximization ? "max" : "min"} z = ${joinTerms(objTermsArr)}`,
  );
  // Constraints formulation
  tableau.forEach((row, i) => {
    const rowTerms: string[] = [];
    row.forEach((coef, j) => {
      const term = formatNTerm(coef, variables[j]);
      if (term) rowTerms.push(term);
    });
    formulationLines.push(`${joinTerms(rowTerms)} = ${rhs[i]}`);
  });
  const formulation = formulationLines.join("\n");

  // Initial state
  const initialState: SimplexState = {
    cj,
    variables,
    basis,
    cb,
    rhs,
    isMaximization,
    tableau,
    zj_cj: [],
    objectiveValue: new MNumber(),
    status: "Initial",
    explanation: useBigM
      ? "Big M Method (artificial variables included)"
      : "Standard Simplex Method",
    useBigM,
    formulation,
  };
  calculateZjCj(initialState);
  return initialState;
}

function calculateZjCj(state: SimplexState): void {
  // Calculates Zj = sum(Cb[i] * a[i][j]) for each column j
  // Calculates Zj - Cj
  // Calculates Z = sum(Cb[i] * RHS[i])
  state.zj_cj = [];
  let objectiveValue = new MNumber();

  // Calculate Z = sum(CB_i * RHS_i)
  for (let i = 0; i < state.cb.length; i++) {
    objectiveValue = MNumber.add(
      objectiveValue,
      MNumber.multiply(state.cb[i], state.rhs[i]),
    );
  }
  state.objectiveValue = objectiveValue;

  // Calculate Zj - Cj for each variable column
  for (let j = 0; j < state.variables.length; j++) {
    let zj = new MNumber();
    for (let i = 0; i < state.basis.length; i++) {
      const a_ij = state.tableau[i][j]; // Coefficient from main tableau body
      zj = MNumber.add(zj, MNumber.multiply(state.cb[i], a_ij));
    }
    state.zj_cj.push(MNumber.subtract(zj, state.cj[j]));
  }
}

export function performSimplexIteration(
  currentState: SimplexState,
): SimplexState {
  const { isMaximization, zj_cj, variables, tableau, rhs, basis, cj } =
    currentState;
  const nextState: SimplexState = structuredClone(currentState);

  // Reconstruct MNumber instances lost during structuredClone
  nextState.cj = nextState.cj.map(
    (val) => new MNumber(val.constant, val.mCoeff),
  );
  nextState.cb = nextState.cb.map(
    (val) => new MNumber(val.constant, val.mCoeff),
  );
  nextState.zj_cj = nextState.zj_cj.map(
    (val) => new MNumber(val.constant, val.mCoeff),
  );
  nextState.objectiveValue = new MNumber(
    nextState.objectiveValue.constant,
    nextState.objectiveValue.mCoeff,
  );

  // 1. Check for Optimality
  let enteringVarIndex = -1;
  let maxZjCj = new MNumber(-Infinity, -Infinity); // For Min: most positive
  let minZjCj = new MNumber(Infinity, Infinity); // For Max: most negative

  if (isMaximization) {
    // Find most negative Zj - Cj
    for (let j = 0; j < zj_cj.length; j++) {
      if (MNumber.compare(zj_cj[j], minZjCj) < 0) {
        minZjCj = zj_cj[j];
        enteringVarIndex = j;
      }
    }
    if (MNumber.compare(minZjCj, new MNumber()) >= 0) {
      // All Zj-Cj >= 0, optimal for Maximization
      nextState.status = "Optimal";
      nextState.explanation = "Optimal solution found (all Zj - Cj >= 0).";
      // Check for artificial variables in basis for feasibility
      // ...
      return nextState;
    }
  } else {
    // Minimization
    // Find most positive Zj - Cj (using MNumber comparison)
    for (let j = 0; j < zj_cj.length; j++) {
      if (MNumber.compare(zj_cj[j], maxZjCj) > 0) {
        maxZjCj = zj_cj[j];
        enteringVarIndex = j;
      }
    }
    if (MNumber.compare(maxZjCj, new MNumber()) <= 0) {
      // All Zj-Cj <= 0, optimal for Minimization
      nextState.status = "Optimal";
      nextState.explanation = "Optimal solution found (all Zj - Cj <= 0).";
      // Check for artificial variables in basis for feasibility
      const artificialInBasis = basis.some(
        (bv: string, index: number) => bv.startsWith("a") && rhs[index] > 1e-9,
      ); // Check if non-zero A-var in basis
      if (artificialInBasis) {
        nextState.status = "Infeasible";
        nextState.explanation =
          "Optimal tableau reached, but artificial variables remain in the basis with positive values. Problem is infeasible.";
      } else {
        nextState.explanation = "Optimal solution found.";
      }
      return nextState;
    }
  }

  const enteringVarName = variables[enteringVarIndex];
  nextState.explanation = `Entering variable: ${enteringVarName} (Indicator value: ${zj_cj[
    enteringVarIndex
  ].toString()}). `;

  // 2. Find Leaving Variable (Minimum Ratio Test)
  let leavingVarIndex = -1; // Row index
  let minRatio = Infinity;
  let isUnbounded = true;

  for (let i = 0; i < tableau.length; i++) {
    const pivotColValue = tableau[i][enteringVarIndex];
    if (pivotColValue > 1e-9) {
      // Use tolerance for floating point > 0 check
      isUnbounded = false;
      const ratio = rhs[i] / pivotColValue;
      if (ratio < minRatio && ratio >= 0) {
        // Non-negative ratio
        minRatio = ratio;
        leavingVarIndex = i;
      }
    }
  }

  if (isUnbounded) {
    nextState.status = "Unbounded";
    nextState.explanation = `Entering variable ${enteringVarName} has no positive coefficients in its column. Problem is unbounded.`;
    return nextState;
  }

  const leavingVarName = basis[leavingVarIndex];
  const pivotElement = tableau[leavingVarIndex][enteringVarIndex];
  nextState.explanation += `Leaving variable: ${leavingVarName} (Min ratio: ${minRatio.toFixed(
    2,
  )} at row ${leavingVarIndex + 1}). Pivot element: ${pivotElement.toFixed(
    2,
  )}.`;

  // 3. Perform Pivot Operation (Row Operations)
  // Update basis, Cb
  nextState.basis[leavingVarIndex] = enteringVarName;
  nextState.cb[leavingVarIndex] = cj[enteringVarIndex]; // Update Cb with Cj of entering variable

  // Normalize pivot row
  const pivotRow = nextState.tableau[leavingVarIndex];
  for (let j = 0; j < pivotRow.length; j++) {
    pivotRow[j] /= pivotElement;
  }
  nextState.rhs[leavingVarIndex] /= pivotElement;

  // Update other rows (make other elements in pivot column zero)
  for (let i = 0; i < nextState.tableau.length; i++) {
    if (i !== leavingVarIndex) {
      const factor = nextState.tableau[i][enteringVarIndex];
      const currentRow = nextState.tableau[i];
      for (let j = 0; j < currentRow.length; j++) {
        currentRow[j] -= factor * pivotRow[j];
      }
      nextState.rhs[i] -= factor * nextState.rhs[leavingVarIndex];
    }
  }

  // 4. Recalculate Zj - Cj and Objective Value
  calculateZjCj(nextState); // Recalculate using updated tableau, basis, cb, rhs
  nextState.status = "Running";

  return nextState;
}

export function interpretSolution(finalState: SimplexState): string {
  if (finalState.status === "Optimal") {
    let interpretation = `Optimal solution found.\nObjective value (Z) = ${finalState.objectiveValue.toString()}\n`;
    const solution: Record<string, number> = {};
    finalState.variables.forEach((v: string) => (solution[v] = 0)); // Initialize all variables to 0
    finalState.basis.forEach((bv: string, index: number) => {
      solution[bv] = finalState.rhs[index];
    });
    interpretation += "Variable values:\n";
    for (const [key, value] of Object.entries(solution)) {
      if (!key.startsWith("a")) {
        // Don't show artificial vars in final solution
        interpretation += `  ${key} = ${value.toFixed(4)}\n`;
      }
    }
    // Double check feasibility if Big M was used
    const artificialInBasis = finalState.basis.some(
      (bv: string, index: number) =>
        bv.startsWith("a") && finalState.rhs[index] > 1e-9,
    );
    if (artificialInBasis) {
      return `Problem is Infeasible. Artificial variable(s) remain in the optimal basis with positive values. Z = ${finalState.objectiveValue.toString()}`;
    }
    return interpretation;
  } else if (finalState.status === "Infeasible") {
    return `Problem is Infeasible. Artificial variable(s) remain in the basis when optimality conditions are met. Z = ${finalState.objectiveValue.toString()}`;
  } else if (finalState.status === "Unbounded") {
    return "Problem is Unbounded. The objective function can be decreased (for min) or increased (for max) indefinitely.";
  } else {
    return "Solver did not reach a terminal state.";
  }
}
