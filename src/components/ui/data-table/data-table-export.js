"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import BigButton from "@/components/ui/big-button";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataTableExport({ table, exportFileName = "export" }) {
  const getExportData = () => {
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => !["select", "actions"].includes(col.id));

    const headers = visibleColumns.map((col) => col.id);

    const dataRows =
      table.getSelectedRowModel().rows.length > 0
        ? table.getSelectedRowModel().rows
        : table.getSortedRowModel().rows;

    const rows = dataRows.map((row) =>
      visibleColumns.map((col) => row.getValue(col.id)),
    );

    return { headers, rows };
  };

  const escapeCsvCell = (cell) => {
    if (cell === null || cell === undefined) return "";
    const str = String(cell);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const exportToCsv = () => {
    const { headers, rows } = getExportData();
    const csvHeaders = headers.map(escapeCsvCell);
    const csvRows = rows.map((r) => r.map(escapeCsvCell).join(","));
    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${exportFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = () => {
    const { headers, rows } = getExportData();
    const doc = new jsPDF({ orientation: "landscape", format: "a4" });
    doc.setFontSize(16);
    doc.text("Data Export", 14, 22);

    const tableData = rows.map((row) =>
      row.map((cell) => (cell == null ? "" : String(cell))),
    );

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] }, // slate-600
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      margin: { top: 30 },
    });

    doc.save(`${exportFileName}.pdf`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BigButton icon={ArrowDownTrayIcon}>Export</BigButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Export Data Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToCsv}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPdf}>Export as PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
