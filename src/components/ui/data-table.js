"use client";

/**
 * DataTable component
 *
 * Pass an onRowAction callback to handle custom actions.
 */

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table/data-table-pagination";
import { useState, useMemo, useEffect } from "react";
import { DataTableViewOptions } from "./data-table/data-table-view-options";
import { Input } from "./input";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import DataTableFilters from "./data-table/data-table-filters";
import { DataTableExport } from "./data-table/data-table-export";
import { Checkbox } from "./checkbox";
import BigButton from "./big-button";

export function DataTable({
  columns,
  data,
  filterColumns = [],
  onRowAction,
  onRowClick,
  onFiltersChange,
  initialFilters = [],
  initialColumnVisibility = {},
  onAdd,
  onDelete,
  onRefresh,
  enableSelection = true,
  actionMenuItems = [
    { label: "View Details", action: "view" },
    { label: "Edit Item", action: "edit" },
    { label: "Delete Item", action: "delete", isDestructive: true },
  ],
  exportFileName,
  toolbarItems = [],
}) {
  const [pagination, setPagination] = useState({
    pageSize: 25,
    pageIndex: 0,
  });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [customFilters, setCustomFilters] = useState(initialFilters);
  const [rowSelection, setRowSelection] = useState({});

  const internalColumns = useMemo(() => {
    const actionCols = [];
    if (enableSelection) {
      actionCols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    return [...actionCols, ...columns];
  }, [columns, enableSelection]);

  // Apply custom filters to data
  const filteredData = useMemo(() => {
    const activeFilters = customFilters.filter(
      (f) => f.enabled && f.value !== undefined,
    );

    if (activeFilters.length === 0) {
      return data;
    }

    return data.filter((item) => {
      return activeFilters.every((filter) => {
        const { columnKey, operator, value } = filter;

        let itemValue;
        if (columnKey.includes(".")) {
          itemValue = columnKey
            .split(".")
            .reduce((obj, key) => obj?.[key], item);
        } else {
          itemValue = item[columnKey];
        }

        if (itemValue === null || itemValue === undefined) return false;

        switch (operator) {
          case "contains":
            return String(itemValue)
              .toLowerCase()
              .includes(String(value).toLowerCase());
          case "equals":
            return (
              String(itemValue).toLowerCase() === String(value).toLowerCase()
            );
          case "startsWith":
            return String(itemValue)
              .toLowerCase()
              .startsWith(String(value).toLowerCase());
          case "endsWith":
            return String(itemValue)
              .toLowerCase()
              .endsWith(String(value).toLowerCase());
          case "matches":
            try {
              const regex = new RegExp(String(value), "i");
              return regex.test(String(itemValue));
            } catch {
              return false;
            }
          case "=":
            if (typeof itemValue === "number" && typeof value === "number") {
              return itemValue === value;
            }
            return String(itemValue) === String(value);
          case "!=":
            if (typeof itemValue === "number" && typeof value === "number") {
              return itemValue !== value;
            }
            return String(itemValue) !== String(value);
          case ">":
            if (typeof itemValue === "number" && typeof value === "number") {
              return itemValue > value;
            }
            if (itemValue instanceof Date && value instanceof Date) {
              return itemValue > value;
            }
            return String(itemValue) > String(value);
          case ">=":
            if (typeof itemValue === "number" && typeof value === "number") {
              return itemValue >= value;
            }
            if (itemValue instanceof Date && value instanceof Date) {
              return itemValue >= value;
            }
            return String(itemValue) >= String(value);
          case "<":
            if (typeof itemValue === "number" && typeof value === "number") {
              return itemValue < value;
            }
            if (itemValue instanceof Date && value instanceof Date) {
              return itemValue < value;
            }
            return String(itemValue) < String(value);
          case "<=":
            if (typeof itemValue === "number" && typeof value === "number") {
              return itemValue <= value;
            }
            if (itemValue instanceof Date && value instanceof Date) {
              return itemValue <= value;
            }
            return String(itemValue) <= String(value);
          default:
            return true;
        }
      });
    });
  }, [data, customFilters]);

  const handleFiltersChange = (filters) => {
    setCustomFilters(filters);
    onFiltersChange?.(filters);
  };

  const table = useReactTable({
    data: filteredData,
    columns: internalColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      columnVisibility: initialColumnVisibility,
    },
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
  });

  const handleDelete = async () => {
    if (onDelete) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      await onDelete(selectedRows);
      table.resetRowSelection();
      await onRefresh?.();
    }
  };

  const handleAdd = async () => {
    if (onAdd) {
      await onAdd();
      await onRefresh?.();
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row w-full justify-between items-end mb-4 gap-4">
        <div className="flex items-center px-2 h-fit max-md:w-full">
          <MagnifyingGlassIcon className="size-6 mr-2" />
          <Input
            placeholder="Search items..."
            value={table.getState().globalFilter}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            size={40}
            className="md:max-w-sm bg-white"
          />
        </div>
        <div className="flex gap-2 max-md:w-full max-md:justify-center">
          {toolbarItems.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
          {onDelete && table.getSelectedRowModel().rows.length > 0 && (
            <BigButton
              icon={TrashIcon}
              onClick={handleDelete}
              className="text-destructive"
            >
              Delete
            </BigButton>
          )}
          {onAdd && (
            <BigButton icon={PlusIcon} onClick={handleAdd}>
              Add
            </BigButton>
          )}
          {onRefresh && (
            <BigButton icon={ArrowPathIcon} onClick={onRefresh}>
              Refresh
            </BigButton>
          )}
          <DataTableFilters
            table={table}
            columns={filterColumns}
            onFiltersChange={handleFiltersChange}
            initialFilters={initialFilters}
          />
          <DataTableExport table={table} exportFileName={exportFileName} />
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div className="rounded-md border m-2 p-2">
        <Table className="mb-2">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`cursor-pointer`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
