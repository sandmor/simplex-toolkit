// Simple test for MODI functionality
import {
  initializeTransportationProblem,
  performTransportationStep,
  solveTransportationProblem,
} from "./src/transportation-logic/index.js";
import {
  initializeMODI,
  performMODIStep,
} from "./src/transportation-logic/modi.js";

// Test problem
const testProblem = {
  supply: [25, 35, 40],
  demand: [30, 25, 45],
  costs: [
    [8, 6, 10],
    [9, 12, 13],
    [14, 9, 16],
  ],
  supplyLabels: ["S1", "S2", "S3"],
  demandLabels: ["D1", "D2", "D3"],
};

console.log("Testing MODI workflow...");

// 1. Solve with VAM first
let state = initializeTransportationProblem(testProblem, "VAM");
const steps = solveTransportationProblem(state);
const completedState = steps[steps.length - 1];

console.log("Initial VAM solution:", completedState);

// 2. Initialize MODI
const modiState = initializeMODI(completedState);
console.log("MODI initialized:", modiState);

// 3. Perform a few MODI steps
let currentMODI = modiState;
for (let i = 0; i < 5; i++) {
  console.log(`MODI Step ${i + 1}:`);
  const nextMODI = performMODIStep(currentMODI);
  console.log(nextMODI.explanation);
  console.log("Status:", nextMODI.status);

  if (nextMODI.status === "Complete") {
    console.log("MODI optimization complete!");
    break;
  }

  currentMODI = nextMODI;
}

console.log("Test completed.");
