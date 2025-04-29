import { FC } from "react";
import { formatSubscriptsInString } from "../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface SolutionProps {
  interpretation: string;
}

const Solution: FC<SolutionProps> = ({ interpretation }) => {
  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Solution / Status</CardTitle>
        <CardDescription>Final result of the simplex algorithm</CardDescription>
      </CardHeader>
      <CardContent>
        <pre
          className="whitespace-pre-wrap text-sm"
          dangerouslySetInnerHTML={{
            __html: formatSubscriptsInString(interpretation),
          }}
        />
      </CardContent>
    </Card>
  );
};

export default Solution;
