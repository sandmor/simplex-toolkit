// Generic Table Component for Problem Solving Tableaux
import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

export interface CellData {
  value: string | number;
  className?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  subtext?: string;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export interface TableauColumn {
  header: string;
  key: string;
  className?: string;
  subheader?: string;
}

export interface TableauRow {
  key: string;
  cells: Record<string, CellData>;
  className?: string;
  isSpecial?: boolean; // For summary rows, etc.
}

export interface GenericTableauProps {
  title?: string;
  subtitle?: string;
  columns: TableauColumn[];
  rows: TableauRow[];
  footerRows?: TableauRow[];
  badges?: Array<{
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }>;
  customHeader?: ReactNode;
  customFooter?: ReactNode;
}

export default function GenericTableau({
  title,
  subtitle,
  columns,
  rows,
  footerRows = [],
  badges = [],
  customHeader,
  customFooter,
}: GenericTableauProps) {
  const renderCell = (cellData: CellData) => {
    const baseClassName = `${cellData.className || ""} ${
      cellData.isHighlighted ? "bg-yellow-100 border-yellow-400" : ""
    }`;

    return (
      <TableCell
        key={Math.random()}
        className={baseClassName}
        onClick={cellData.onClick}
      >
        <div className="flex flex-col items-center space-y-1">
          <div className="font-medium">{cellData.value}</div>
          {cellData.subtext && (
            <div className="text-xs text-muted-foreground">
              {cellData.subtext}
            </div>
          )}
          {cellData.badge && (
            <Badge
              variant={cellData.badge.variant || "default"}
              className="text-xs"
            >
              {cellData.badge.text}
            </Badge>
          )}
        </div>
      </TableCell>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      {(title || badges.length > 0 || customHeader) && (
        <div className="space-y-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}

          {badges.length > 0 && (
            <div className="flex gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || "default"}>
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}

          {customHeader}
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  <div className="text-center">
                    <div>{col.header}</div>
                    {col.subheader && (
                      <div className="text-xs text-muted-foreground font-normal">
                        {col.subheader}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.key}
                className={`${row.className || ""} ${
                  row.isSpecial ? "bg-muted" : ""
                }`}
              >
                {columns.map((col) =>
                  renderCell(row.cells[col.key] || { value: "" })
                )}
              </TableRow>
            ))}

            {footerRows.map((row) => (
              <TableRow
                key={row.key}
                className={`${row.className || ""} bg-muted`}
              >
                {columns.map((col) =>
                  renderCell(row.cells[col.key] || { value: "" })
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Custom Footer */}
      {customFooter}
    </div>
  );
}
