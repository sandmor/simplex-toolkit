# Linear Programming Toolbox 🚀

[Live Demo](https://sandmor.github.io/simplex-toolbox/)

A modern, interactive step-by-step solver for Linear Programming problems. Includes both the Simplex method and Transportation problem algorithms. Visualize each operation, edit your tableau on the fly, and learn algorithms hands-on. Perfect for students, educators, and professionals diving into linear programming.

## 🎯 Features

### Simplex Method Solver

- **Problem Definition UI:** Define your LP problem with intuitive syntax. Real-time validation highlights errors immediately.
- **Step-by-Step Solver:** Watch the Simplex algorithm unfold pivot by pivot. Navigate forwards/backwards or solve the entire problem at once.
- **Big M & Standard Simplex:** Automatically detects when to apply the Big M method or standard Simplex.
- **Primal/Dual Switching:** Instantly switch between primal and dual formulations to explore duality in action.
- **Editable Tableau:** Jump into edit mode to tweak RHS values or tableau entries manually.
- **Clear Explanations:** Contextual hints and explanations highlight entering/leaving variables and unbounded or infeasible conditions.
- **Solution Interpretation:** Human-readable summary of the final solution, including objective value and variable assignments.

### Transportation Problem Solver

- **Interactive Problem Definition:** Set up supply, demand, and cost matrices with a user-friendly interface.
- **Three Solution Methods:**
  - **Northwest Corner Method (NWC):** Simple allocation starting from the top-left
  - **Least Cost Method (LCM):** Prioritizes minimum transportation costs
  - **Vogel's Approximation Method (VAM):** Often yields near-optimal initial solutions
- **Step-by-Step Visualization:** Watch allocations happen one step at a time with detailed explanations.
- **Automatic Balancing:** Handles unbalanced problems by adding dummy suppliers or demanders.
- **Method Comparison:** Switch between methods to compare their efficiency and resulting costs.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.x
- npm or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/simplex-toolbox.git
cd simplex-toolbox

# Install dependencies
npm install   # or pnpm install
```

### Development

```bash
npm run dev   # starts Vite dev server at http://localhost:5173
```

Open `http://localhost:5173` in your browser. The app reloads on file changes.

### Building for Production

```bash
npm run build
npm run preview  # preview production build
```

## 📐 Usage

### Simplex Method

1. **Select Simplex Mode**: Click the "📊 Simplex Method" button in the header.
2. **Define Your Problem**: Enter your LP problem in the text area using the format:
   ```text
   max z = 40x1 + 30x2
   x1 + x2 <= 12
   2x1 + x2 <= 16
   x1 >= 0
   x2 >= 0
   ```
3. **Validate & Solve**: Real-time feedback ensures a valid formulation. Click **Solve Problem** to initialize.
4. **Explore Steps**:
   - **Next** / **Previous**: Move through pivot operations.
   - **Solve All**: Complete the algorithm automatically.
   - **Edit Tableau**: Adjust values directly and **Save Edits** to continue.
   - **Show Dual**: Toggle between primal and dual views.
5. **View Solution**: Once solved, inspect the final objective value and variable assignments in the Solution card.

### Transportation Problems

1. **Select Transportation Mode**: Click the "🚚 Transportation Problem" button in the header.
2. **Set Problem Size**: Choose the number of suppliers and demanders (2-5 each).
3. **Define Problem**: Fill in the cost matrix, supply values, and demand values.
4. **Choose Method**: Select from:
   - **Northwest Corner Method (NWC)**: Simple allocation starting from top-left
   - **Least Cost Method (LCM)**: Allocates to minimum cost cells first
   - **Vogel's Approximation Method (VAM)**: Uses penalties to find better initial solutions
   - **MODI Method**: Optimizes existing solutions using dual variables
5. **Solve Step-by-Step**: Use the navigation controls to see each allocation step with detailed explanations.
6. **Optimize Solutions**: After finding an initial solution with NWC/LCM/VAM, click "⚡ Optimize with MODI" to improve it further.
7. **Compare Methods**: Switch between methods to see how they differ in approach and resulting costs.

#### MODI Method Features

- **Dual Variable Calculation**: Automatically calculates ui and vj values
- **Opportunity Cost Analysis**: Shows opportunity costs for all non-basic variables
- **Closed Loop Finding**: Visualizes the closed loop for improving solutions
- **Step-by-Step Optimization**: Shows each iteration of the optimization process
- **Optimality Testing**: Determines when the solution is optimal

## 📚 Learn More

- Dive into the code in `src/simplex-logic` to understand parsing, tableau operations, and the Big M implementation.
- Explore `src/transportation-logic` for the three transportation algorithms implementation.
- UI components are built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/).

## 📜 License

This project is licensed under the MIT License.
