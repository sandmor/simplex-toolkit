import { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "./ui/form";
import { parseProblem } from "../simplex-logic/problem-parser";
import { Objective, Constraint } from "../simplex-logic/big-m";
import { useForm } from "react-hook-form";

const EXAMPLE_PROBLEM = `max z = 40x1 + 30x2
x1 + x2 <= 12
2x1 + x2 <= 16
x1 >= 0
x2 >= 0`;

interface ProblemDefinitionProps {
  onProblemSubmit: (problem: {
    objective: Objective;
    constraints: Constraint[];
    isMaximization: boolean;
  }) => void;
}

interface FormValues {
  problemText: string;
}

function ProblemDefinition({ onProblemSubmit }: ProblemDefinitionProps) {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors?: string[];
  }>({ isValid: true });

  const form = useForm<FormValues>({
    defaultValues: {
      problemText: EXAMPLE_PROBLEM,
    },
  });

  // Real-time validation
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.problemText) {
        const result = parseProblem(value.problemText);
        setValidationResult({
          isValid: result.isValid,
          errors: result.errors,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Initial validation on component mount
  useEffect(() => {
    const result = parseProblem(form.getValues().problemText);
    setValidationResult({
      isValid: result.isValid,
      errors: result.errors,
    });
  }, [form]);

  const onSubmit = (data: FormValues) => {
    const result = parseProblem(data.problemText);
    if (
      result.isValid &&
      result.objective &&
      result.constraints &&
      result.isMaximization !== undefined
    ) {
      onProblemSubmit({
        objective: result.objective,
        constraints: result.constraints,
        isMaximization: result.isMaximization,
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Problem Definition</CardTitle>
        <CardDescription>
          Define your linear programming problem below. Format: first line is
          the objective function (min/max z = ...), followed by constraints.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="problemText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Formulation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your linear programming problem here..."
                      className="font-mono min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  {!validationResult.isValid && (
                    <div className="text-red-500 text-sm mt-2">
                      {validationResult.errors?.map((error, index) => (
                        <p key={index}>{error}</p>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center mt-4">
              <div>
                {validationResult.isValid && (
                  <span className="text-green-600 text-sm">
                    ✅ Valid problem formulation
                  </span>
                )}
              </div>
              <Button
                type="submit"
                disabled={!validationResult.isValid}
                className="ml-auto"
              >
                Solve Problem
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default ProblemDefinition;
