# Simplex Toolbox 🚀

[Live Demo](https://sandmor.github.io/simplex-toolbox/)

A modern, interactive step-by-step Simplex method editor and solver. Visualize each pivot operation, edit your tableau on the fly, and learn the Simplex algorithm hands-on. Perfect for students, educators, and professionals diving into linear programming.

## 🎯 Features

- **Problem Definition UI:** Define your LP problem with intuitive syntax. Real-time validation highlights errors immediately.
- **Step-by-Step Solver:** Watch the Simplex algorithm unfold pivot by pivot. Navigate forwards/backwards or solve the entire problem at once.
- **Big M & Standard Simplex:** Automatically detects when to apply the Big M method or standard Simplex.
- **Primal/Dual Switching:** Instantly switch between primal and dual formulations to explore duality in action.
- **Editable Tableau:** Jump into edit mode to tweak RHS values or tableau entries manually.
- **Clear Explanations:** Contextual hints and explanations highlight entering/leaving variables and unbounded or infeasible conditions.
- **Solution Interpretation:** Human-readable summary of the final solution, including objective value and variable assignments.

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

1. **Define Your Problem**: Enter your LP problem in the text area using the format:
   ```text
   max z = 40x1 + 30x2
   x1 + x2 <= 12
   2x1 + x2 <= 16
   x1 >= 0
   x2 >= 0
   ```
2. **Validate & Solve**: Real-time feedback ensures a valid formulation. Click **Solve Problem** to initialize.
3. **Explore Steps**:
   - **Next** / **Previous**: Move through pivot operations.
   - **Solve All**: Complete the algorithm automatically.
   - **Edit Tableau**: Adjust values directly and **Save Edits** to continue.
   - **Show Dual**: Toggle between primal and dual views.
4. **View Solution**: Once solved, inspect the final objective value and variable assignments in the Solution card.

## 📚 Learn More

- Dive into the code in `src/simplex-logic` to understand parsing, tableau operations, and the Big M implementation.
- UI components are built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/).

## 📜 License

This project is licensed under the MIT License.
