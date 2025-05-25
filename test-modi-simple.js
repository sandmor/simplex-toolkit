// Simple browser-compatible test for MODI
// This can be copy-pasted into browser console

console.log("Testing MODI step logic...");

// Simulate the step logic issue
function testMODIStepConditions() {
  console.log("Testing MODI step conditions:");

  // Test case 1: isOptimal is undefined (should calculate opportunity costs)
  let state1 = { isOptimal: undefined };
  console.log("Case 1 - isOptimal undefined:", state1.isOptimal === undefined); // Should be true

  // Test case 2: isOptimal is false (not optimal, should proceed)
  let state2 = { isOptimal: false };
  console.log("Case 2 - isOptimal false:", state2.isOptimal === undefined); // Should be false
  console.log("Case 2 - isOptimal is false:", state2.isOptimal === false); // Should be true

  // Test case 3: isOptimal is true (optimal, should complete)
  let state3 = { isOptimal: true };
  console.log("Case 3 - isOptimal true:", state3.isOptimal === true); // Should be true

  console.log("Step condition logic:");
  console.log(
    "  Step 2 condition (calculate opp costs):",
    state1.isOptimal === undefined
  );
  console.log("  Optimal check (should complete):", state3.isOptimal === true);
  console.log("  Not optimal (should proceed):", state2.isOptimal === false);
}

testMODIStepConditions();

console.log("Copy this code and paste it in the browser console to test!");
