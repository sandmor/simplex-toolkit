# 🚀 Development Guide

## 🛠️ Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Version 8 or higher (recommended package manager)
- **Git**: For version control

## 🏗️ Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/sandmor/simplex-toolbox.git
   cd simplex-toolbox
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── common/                          # Generic, reusable components
│   ├── generic-problem-solver-app.tsx   # Main app container
│   ├── generic-step-controls.tsx        # Navigation controls
│   ├── generic-problem-definition.tsx   # Problem input forms
│   └── generic-tableau.tsx              # Data display tables
├── components/                      # Specific UI components
│   ├── ui/                         # Base UI components (buttons, cards, etc.)
│   ├── *-controls.tsx              # Method-specific controls
│   ├── *-explanation.tsx           # Step explanations
│   ├── *-problem-definition.tsx    # Input forms
│   ├── *-solution.tsx              # Final results
│   └── *-tableau.tsx               # Data tables
├── *-logic/                        # Algorithm implementations
│   ├── types.ts                    # Type definitions
│   ├── common.ts                   # Shared utilities
│   ├── index.ts                    # Main exports
│   └── *.ts                        # Algorithm-specific files
└── lib/                            # Utility functions
```

## 🧮 Architecture Overview

The project uses a **generic architecture** pattern where common functionality is abstracted into reusable components:

### Generic Components

- **`GenericProblemSolverApp`**: Main container that handles state management and step navigation
- **`GenericStepControls`**: Reusable navigation buttons and custom controls
- **`GenericProblemDefinition`**: Flexible form builder for problem inputs
- **`GenericTableau`**: Configurable data table display

### Problem-Specific Implementations

Each solver (Simplex, Transportation, Assignment) provides:

- **Configuration objects** that define how to use the generic components
- **Algorithm implementations** in dedicated logic folders
- **Custom UI components** for specialized displays

## 🔧 Available Scripts

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Start development server        |
| `pnpm build`     | Build for production            |
| `pnpm preview`   | Preview production build        |
| `pnpm lint`      | Run ESLint                      |
| `pnpm lint:fix`  | Fix ESLint issues automatically |
| `pnpm typecheck` | Run TypeScript type checking    |
| `pnpm ci`        | Run full CI pipeline locally    |
| `pnpm clean`     | Clean build artifacts           |
| `pnpm deploy`    | Deploy to GitHub Pages          |

## 🏗️ Adding a New Solver

To add a new problem type (e.g., Network Flow):

1. **Create logic folder**:

   ```
   src/network-flow-logic/
   ├── types.ts
   ├── common.ts
   ├── index.ts
   └── algorithm.ts
   ```

2. **Create components**:

   ```
   src/components/
   ├── network-flow-controls.tsx
   ├── network-flow-explanation.tsx
   ├── network-flow-problem-definition.tsx
   ├── network-flow-solution.tsx
   └── network-flow-tableau.tsx
   ```

3. **Create main app**:

   ```typescript
   // src/NetworkFlowApp.tsx
   import GenericProblemSolverApp from "./common/generic-problem-solver-app";

   const config = {
     title: "Network Flow Problem",
     // ... other configuration
   };

   export default function NetworkFlowApp() {
     return <GenericProblemSolverApp config={config} />;
   }
   ```

4. **Add to main app**:
   Update `src/App.tsx` to include the new solver option.

## 🧪 Testing Guidelines

### Manual Testing Checklist

For each solver, verify:

- [ ] Problem input validation works
- [ ] Step-by-step execution works
- [ ] "Solve All" button works
- [ ] Final solution is correct
- [ ] Error handling for invalid inputs
- [ ] Responsive design on mobile

### Code Quality Standards

- **TypeScript**: All code must be properly typed (no `any` types)
- **ESLint**: All code must pass linting
- **Formatting**: Use consistent code formatting
- **Comments**: Complex algorithms should be well-documented

## 🎨 UI/UX Guidelines

### Design Principles

- **Clarity**: Information should be easy to understand
- **Progressive Disclosure**: Show details step-by-step
- **Responsiveness**: Works on all screen sizes
- **Accessibility**: Follows web accessibility standards

### Component Guidelines

- Use **shadcn/ui** components as base
- Follow **Tailwind CSS** conventions
- Implement **dark mode** considerations
- Ensure **keyboard navigation** works

## 🔍 Debugging

### Common Issues

1. **Build Errors**: Check TypeScript types and imports
2. **Runtime Errors**: Check browser console and React DevTools
3. **Algorithm Issues**: Add console logs in logic files
4. **UI Issues**: Use browser DevTools for CSS debugging

### Debug Tools

- **React DevTools**: Browser extension for React debugging
- **VS Code Debugger**: Set breakpoints in TypeScript code
- **Console Logging**: Strategic logging in algorithm files

## 🚀 Deployment

### GitHub Pages (Automatic)

- Push to `main` branch triggers automatic deployment
- Site available at: `https://sandmor.github.io/simplex-toolbox/`

### Manual Deployment

```bash
pnpm build
pnpm deploy
```

### Other Platforms

The built `dist/` folder can be deployed to:

- **Netlify**: Drag and drop deployment
- **Vercel**: Git integration
- **AWS S3**: Static website hosting
- **Any static hosting service**

## 📚 Learning Resources

### Linear Programming

- [Introduction to Linear Programming](https://en.wikipedia.org/wiki/Linear_programming)
- [Simplex Method Explained](https://en.wikipedia.org/wiki/Simplex_algorithm)
- [Transportation Problem](<https://en.wikipedia.org/wiki/Transportation_theory_(mathematics)>)
- [Assignment Problem](https://en.wikipedia.org/wiki/Assignment_problem)

### Technical Stack

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.
