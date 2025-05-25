import { useState } from "react";
import SimplexApp from "./SimplexApp.tsx";
import TransportationApp from "./TransportationApp.tsx";
import AssignmentApp from "./AssignmentApp.tsx";
import { Button } from "./components/ui/button.tsx";

function App() {
  const [currentMode, setCurrentMode] = useState<
    "simplex" | "transportation" | "assignment"
  >("simplex");

  return (
    <div className="App max-w-7xl mx-auto p-6">
      {/* Mode Selection Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Linear Programming Toolbox
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Choose your problem type and solve step-by-step
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={currentMode === "simplex" ? "default" : "outline"}
            onClick={() => setCurrentMode("simplex")}
            className="px-6 py-3"
          >
            📊 Simplex Method
          </Button>
          <Button
            variant={currentMode === "transportation" ? "default" : "outline"}
            onClick={() => setCurrentMode("transportation")}
            className="px-6 py-3"
          >
            🚚 Transportation Problem
          </Button>
          <Button
            variant={currentMode === "assignment" ? "default" : "outline"}
            onClick={() => setCurrentMode("assignment")}
            className="px-6 py-3"
          >
            🎯 Assignment Problem
          </Button>
        </div>
      </div>

      {/* Conditional Rendering based on mode */}
      {currentMode === "transportation" ? (
        <TransportationApp />
      ) : currentMode === "assignment" ? (
        <AssignmentApp />
      ) : (
        <SimplexApp />
      )}
    </div>
  );
}

export default App;
