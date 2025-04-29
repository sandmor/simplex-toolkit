import { FC, JSX } from "react";
import { calculatePivotInfo } from "../simplex-logic/pivot-utils";
import { formatVar, formatSubscriptsInString } from "../lib/utils";
import { SimplexState } from "../simplex-logic/big-m";

interface ExplanationProps {
  state: SimplexState;
}

const Explanation: FC<ExplanationProps> = ({ state }) => {
  const { status } = state;
  let content: string | JSX.Element;
  if (status === "Running" || status === "Initial") {
    const info = calculatePivotInfo(state);
    if (info.isUnbounded) {
      content = (
        <span>
          Unbounded: entering variable {formatVar(info.enteringVarName!)} has no
          positive column coefficients.
        </span>
      );
    } else if (
      info.enteringVarIndex === null ||
      info.leavingRowIndex === null
    ) {
      content = <span>No pivot needed (optimal or no improvement).</span>;
    } else {
      content = (
        <span>
          Next pivot: enter <b>{formatVar(info.enteringVarName!)}</b>, leave{" "}
          <b>{formatVar(info.leavingVarName!)}</b> (ratio{" "}
          {info.minRatioValue?.toFixed(2)})
        </span>
      );
    }
  } else {
    // Terminal states: show final explanation
    content = state.explanation;
  }
  return (
    <div className="bg-muted/50 p-4 rounded-md my-4 border border-muted">
      {typeof content === "string" ? (
        <p
          className="text-muted-foreground italic"
          dangerouslySetInnerHTML={{
            __html: formatSubscriptsInString(content),
          }}
        />
      ) : (
        <p className="text-muted-foreground italic">{content}</p>
      )}
    </div>
  );
};

export default Explanation;
