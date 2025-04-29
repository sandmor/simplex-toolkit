import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Render a variable name with numeric subscript HTML.
 */
export const formatVar = (v: string): React.ReactNode => {
  const match = v.match(/^([a-zA-Z]+)(\d+)$/);
  if (match) {
    return (
      <>
        {match[1]}
        <sub>{match[2]}</sub>
      </>
    );
  }
  return v;
};

/**
 * Format a text string, replacing variable names (x1, y2) with subscript HTML and newlines with <br>.
 */
export function formatSubscriptsInString(str: string): string {
  return str
    .replace(/([a-zA-Z]+)(\d+)/g, "$1<sub>$2</sub>")
    .replace(/\n/g, "<br/>");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
