"use client";

import { useState } from "react";
import { FunnelIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FunnelIcon as SolidFunnelIcon } from "@heroicons/react/24/solid";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { Calendar } from "../calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
import { Label } from "../label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import BigButton from "@/components/ui/big-button";

const STRING_OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "matches", label: "Matches (regex)" },
];

const NUMBER_OPERATORS = [
  { value: "=", label: "=" },
  { value: "!=", label: "!=" },
  { value: ">", label: ">" },
  { value: ">=", label: ">=" },
  { value: "<", label: "<" },
  { value: "<=", label: "<=" },
];

const DATE_OPERATORS = [
  { value: "=", label: "=" },
  { value: "!=", label: "!=" },
  { value: ">", label: ">" },
  { value: ">=", label: ">=" },
  { value: "<", label: "<" },
  { value: "<=", label: "<=" },
];

// Define operators for enum type, typically an "equals" or "is" operator
const ENUM_OPERATORS = [{ value: "equals", label: "Is" }];

export function DataTableFilters({
  // table,
  columns,
  onFiltersChange,
  initialFilters = [],
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const getOperatorsForType = (type) => {
    switch (type) {
      case "string":
        return STRING_OPERATORS;
      case "number":
        return NUMBER_OPERATORS;
      case "date":
        return DATE_OPERATORS;
      case "enum": // Updated to use ENUM_OPERATORS
        return ENUM_OPERATORS;
      default:
        return [];
    }
  };

  const getColumnByKey = (key) => {
    return columns.find((col) => col.key === key);
  };

  const addFilter = (columnKey) => {
    const column = getColumnByKey(columnKey);
    if (!column) return;

    const operators = getOperatorsForType(column.type);
    const newFilter = {
      id: `${columnKey}-${Date.now()}`,
      columnKey,
      operator: operators.length > 0 ? operators[0].value : "",
      value: undefined,
      enabled: true,
    };

    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const updateFilter = (id, updates) => {
    const updatedFilters = filters.map((filter) =>
      filter.id === id ? { ...filter, ...updates } : filter,
    );
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const removeFilter = (id) => {
    const updatedFilters = filters.filter((filter) => filter.id !== id);
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const toggleFilterEnabled = (id) => {
    const updatedFilters = filters.map((filter) =>
      filter.id === id ? { ...filter, enabled: !filter.enabled } : filter,
    );
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const activeFiltersCount = filters.filter((f) => f.enabled).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <BigButton icon={isOpen ? SolidFunnelIcon : FunnelIcon}>
          {activeFiltersCount > 0 ? `Filters(${activeFiltersCount})` : "Filter"}
        </BigButton>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-48">
                  <PlusIcon className="size-4 mr-2" />
                  Add filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {columns.map((column) => (
                  <DropdownMenuItem
                    key={column.key}
                    onClick={() => addFilter(column.key)}
                  >
                    {column.title || column.key}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            {filters.map((filter) => {
              const column = getColumnByKey(filter.columnKey);
              if (!column) return null;

              const operators = getOperatorsForType(column.type);

              return (
                <div
                  key={filter.id}
                  className="border rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filter.enabled}
                        onCheckedChange={() => toggleFilterEnabled(filter.id)}
                      />
                      <Label className="font-medium">{column.key}</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(filter.id)}
                      className="h-6 w-6 p-0"
                    >
                      <XMarkIcon className="size-4" />
                    </Button>
                  </div>

                  {filter.enabled && (
                    <div className="space-y-2">
                      {/* Show operator select only if there are operators available */}
                      {operators.length > 0 && (
                        <Select
                          value={filter.operator}
                          onValueChange={(value) =>
                            updateFilter(filter.id, { operator: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {column.type === "string" && (
                        <div className="space-y-2">
                          {column.values ? (
                            <Command>
                              <CommandInput placeholder="Search values..." />
                              <CommandList>
                                <CommandEmpty>No values found.</CommandEmpty>
                                <CommandGroup>
                                  {column.values.map((value) => (
                                    <CommandItem
                                      key={value}
                                      value={value}
                                      onSelect={(currentValue) => {
                                        updateFilter(filter.id, {
                                          value: currentValue,
                                        });
                                      }}
                                    >
                                      {value}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          ) : (
                            <Input
                              placeholder="Enter value..."
                              value={filter.value || ""}
                              onChange={(e) =>
                                updateFilter(filter.id, {
                                  value: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      )}

                      {column.type === "number" && (
                        <Input
                          type="number"
                          placeholder="Enter value..."
                          value={filter.value || ""}
                          onChange={(e) =>
                            updateFilter(filter.id, {
                              value: parseFloat(e.target.value) || undefined,
                            })
                          }
                        />
                      )}

                      {column.type === "date" && (
                        <div className="space-y-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                {filter.value
                                  ? filter.value.toLocaleDateString()
                                  : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={filter.value}
                                onSelect={(date) =>
                                  updateFilter(filter.id, { value: date })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}

                      {column.type === "enum" && column.values && (
                        <Select
                          // Changed value prop to allow undefined/null for placeholder behavior
                          value={filter.value}
                          onValueChange={(value) =>
                            updateFilter(filter.id, { value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {column.values.map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filters.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No filters applied. Click &quot;Add filter&quot; to get started.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DataTableFilters;
