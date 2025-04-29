import { Objective, Constraint } from "./big-m";

// Regex patterns for parsing
const OBJECTIVE_REGEX = /^\s*(min|max|minimize|maximize)\s+z\s*=\s*(.+)$/i;
const CONSTRAINT_REGEX = /^\s*(.+?)\s*([<>=]=|[<>])\s*(.+)\s*$/i;
const VARIABLE_TERM_REGEX = /([-+]?\s*\d*\.?\d*)\s*([a-zA-Z]\d*)/g;

interface ParseResult {
  isValid: boolean;
  objective?: Objective;
  constraints?: Constraint[];
  isMaximization?: boolean;
  errors?: string[];
}

export function parseProblem(text: string): ParseResult {
  const result: ParseResult = {
    isValid: true,
    constraints: [],
    errors: [],
  };

  if (!text.trim()) {
    return {
      isValid: false,
      errors: ["Problem definition is empty"],
    };
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return {
      isValid: false,
      errors: ["Need at least an objective function and one constraint"],
    };
  }

  // Parse the first line as the objective function
  const objectiveMatch = lines[0].match(OBJECTIVE_REGEX);
  if (!objectiveMatch) {
    return {
      isValid: false,
      errors: [
        "Invalid objective function format. Should be 'min/max z = expression'",
      ],
    };
  }

  const isMaximization = objectiveMatch[1].toLowerCase().startsWith("max");
  const objExpression = objectiveMatch[2].trim();

  const {
    variables: objVars,
    coefficients: objCoeffs,
    error: objError,
  } = parseExpression(objExpression);

  if (objError) {
    return {
      isValid: false,
      errors: [objError],
    };
  }

  result.objective = {
    variables: objVars,
    coefficients: objCoeffs,
  };
  result.isMaximization = isMaximization;

  // Parse constraints
  const constraints: Constraint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Skip comments or empty lines
    if (line.startsWith("//") || !line.trim()) continue;

    const constraintMatch = line.match(CONSTRAINT_REGEX);
    if (!constraintMatch) {
      return {
        isValid: false,
        errors: [`Invalid constraint format at line ${i + 1}`],
      };
    }

    const leftSide = constraintMatch[1].trim();
    const constraintType = mapConstraintType(constraintMatch[2]);
    const rightSide = constraintMatch[3].trim();

    const {
      variables,
      coefficients,
      error: leftError,
    } = parseExpression(leftSide);
    if (leftError) {
      return {
        isValid: false,
        errors: [`Error in constraint at line ${i + 1}: ${leftError}`],
      };
    }

    // Right side should be a number
    const rhsValue = parseFloat(rightSide);
    if (isNaN(rhsValue)) {
      return {
        isValid: false,
        errors: [`Right side of constraint at line ${i + 1} must be a number`],
      };
    }

    constraints.push({
      variables,
      coefficients,
      type: constraintType,
      rhs: rhsValue,
    });
  }

  if (constraints.length === 0) {
    return {
      isValid: false,
      errors: ["No valid constraints found"],
    };
  }

  // Check that all constraints use consistent variable names
  const allVars = new Set<string>(result.objective?.variables || []);
  for (const constraint of constraints) {
    for (const v of constraint.variables) {
      allVars.add(v);
    }
  }

  // Ensure all variables appear in all constraints and objective
  for (const constraint of constraints) {
    for (const v of allVars) {
      if (!constraint.variables.includes(v)) {
        constraint.variables.push(v);
        constraint.coefficients.push(0);
      }
    }
  }

  // Update objective to include all variables
  if (result.objective) {
    for (const v of allVars) {
      if (!result.objective.variables.includes(v)) {
        result.objective.variables.push(v);
        result.objective.coefficients.push(0);
      }
    }
  }

  // Sort variables consistently
  const sortedVars = Array.from(allVars).sort();

  // Reorder all coefficients to match the sorted variable order
  if (result.objective) {
    result.objective = reorderCoefficients(result.objective, sortedVars);
  }

  constraints.forEach((constraint, i) => {
    constraints[i] = reorderCoefficients(constraint, sortedVars);
  });

  result.constraints = constraints;
  return result;
}

function parseExpression(expr: string): {
  variables: string[];
  coefficients: number[];
  error?: string;
} {
  const result: {
    variables: string[];
    coefficients: number[];
    error?: string;
  } = {
    variables: [],
    coefficients: [],
  };

  const terms: Map<string, number> = new Map();
  let match;

  // Replace +- with - for cleaner parsing
  expr = expr.replace(/\+\s*-/g, "-");

  // Ensure the expression starts with a sign (+ or -) for easier parsing
  if (!expr.trim().startsWith("+") && !expr.trim().startsWith("-")) {
    expr = "+ " + expr;
  }

  // Reset regex state
  VARIABLE_TERM_REGEX.lastIndex = 0;

  while ((match = VARIABLE_TERM_REGEX.exec(expr)) !== null) {
    let coeff = match[1].replace(/\s+/g, "");
    const variable = match[2];

    // Handle coefficients: +x1 means +1*x1, -x1 means -1*x1, just x1 means 1*x1
    if (coeff === "+" || coeff === "") {
      coeff = "1";
    } else if (coeff === "-") {
      coeff = "-1";
    }

    const numCoeff = parseFloat(coeff);
    if (isNaN(numCoeff)) {
      return {
        variables: [],
        coefficients: [],
        error: `Invalid coefficient: ${coeff} for variable ${variable}`,
      };
    }

    // Add to terms, combining if variable appears multiple times
    terms.set(variable, (terms.get(variable) || 0) + numCoeff);
  }

  // Check if the entire expression was consumed
  if (expr.replace(VARIABLE_TERM_REGEX, "").trim() !== "") {
    // There are remaining characters that don't match the pattern
    return {
      variables: [],
      coefficients: [],
      error: "Invalid terms in expression",
    };
  }

  // Convert Map to arrays
  terms.forEach((coeff, variable) => {
    result.variables.push(variable);
    result.coefficients.push(coeff);
  });

  return result;
}

function mapConstraintType(type: string): ">=" | "<=" | "=" {
  type = type.trim();
  if (type === ">=" || type === ">") return ">=";
  if (type === "<=" || type === "<") return "<=";
  return "=";
}

function reorderCoefficients<
  T extends { variables: string[]; coefficients: number[] },
>(item: T, targetOrder: string[]): T {
  const newCoeffs: number[] = [];
  const coeffMap: Record<string, number> = {};

  item.variables.forEach((v, i) => {
    coeffMap[v] = item.coefficients[i];
  });

  for (const v of targetOrder) {
    newCoeffs.push(coeffMap[v] || 0);
  }

  return {
    ...item,
    variables: [...targetOrder],
    coefficients: newCoeffs,
  } as T;
}
