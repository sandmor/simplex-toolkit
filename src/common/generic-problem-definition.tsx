// Generic Problem Definition Component
import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export interface ProblemField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "matrix" | "custom";
  value: unknown;
  options?: Array<{ value: string | number; label: string }>;
  validation?: (value: unknown) => { isValid: boolean; error?: string };
  onChange: (value: unknown) => void;
  placeholder?: string;
  description?: string;
  customRenderer?: (field: ProblemField) => ReactNode;
}

export interface ProblemSection {
  title: string;
  description?: string;
  fields: ProblemField[];
}

export interface GenericProblemDefinitionProps<TProblem> {
  title: string;
  description: string;
  sections: ProblemSection[];
  onSubmit: (problem: TProblem) => void;
  buildProblem: () => TProblem;
  validateProblem: (problem: TProblem) => {
    isValid: boolean;
    errors?: string[];
  };
  examples?: Array<{
    name: string;
    description: string;
    data: TProblem;
    onLoad: () => void;
  }>;
}

export default function GenericProblemDefinition<TProblem>({
  title,
  description,
  sections,
  onSubmit,
  buildProblem,
  validateProblem,
  examples = [],
}: GenericProblemDefinitionProps<TProblem>) {
  const renderField = (field: ProblemField) => {
    if (field.customRenderer) {
      return field.customRenderer(field);
    }

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={(field.value as string) || ""}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full p-2 border rounded"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={(field.value as number) || ""}
            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            className="w-full p-2 border rounded"
          />
        );

      case "select":
        return (
          <select
            value={(field.value as string) || ""}
            onChange={(e) => field.onChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  const handleSubmit = () => {
    const problem = buildProblem();
    const validation = validateProblem(problem);

    if (validation.isValid) {
      onSubmit(problem);
    } else {
      // Handle validation errors
      console.error("Problem validation failed:", validation.errors);
    }
  };

  const problem = buildProblem();
  const validation = validateProblem(problem);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Examples */}
        {examples.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Quick Examples:</h4>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={example.onLoad}
                  title={example.description}
                >
                  {example.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <div>
              <h4 className="font-medium">{section.title}</h4>
              {section.description && (
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              )}
            </div>

            <div className="grid gap-4">
              {section.fields.map((field) => {
                const validation = field.validation?.(field.value);

                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {field.label}
                      {field.description && (
                        <span className="block text-xs text-muted-foreground font-normal">
                          {field.description}
                        </span>
                      )}
                    </label>

                    {renderField(field)}

                    {validation && !validation.isValid && (
                      <p className="text-sm text-red-600">{validation.error}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Validation Summary */}
        {!validation.isValid && validation.errors && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-medium text-red-800 mb-2">
              Validation Errors:
            </h4>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!validation.isValid}
          className="w-full"
          size="lg"
        >
          Solve Problem
        </Button>
      </CardContent>
    </Card>
  );
}
