import React, { useState } from "react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { AccessLevel, ShaderMetadata } from "@/types/shader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  data: ShaderMetadata[];
};
const SortableHeader = ({
  column,
  name,
}: {
  column: Column<ShaderMetadata, unknown>;
  name: string;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={column.getToggleSortingHandler()}
      className={cn(column.getIsSorted() && "text-primary")}
      title={
        column.getCanSort()
          ? column.getNextSortingOrder() === "asc"
            ? "Sort Ascending"
            : column.getNextSortingOrder() === "desc"
              ? "Sort Descending"
              : "Clear Sort"
          : undefined
      }
    >
      {name}
      {{
        asc: <ArrowUp />,
        desc: <ArrowDown />,
      }[column.getIsSorted() as string] ?? null}
    </Button>
  );
};

const columns: ColumnDef<ShaderMetadata>[] = [
  {
    accessorKey: "preview_img_url",
    header: "",
    cell: ({ row }) => {
      const previewImgUrl = row.getValue("preview_img_url") as string;
      if (previewImgUrl) {
        return (
          <div className="w-24">
            <Image width={320} height={180} alt="preview" src={previewImgUrl} />
          </div>
        );
      }
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} name="Title" />,
    cell: ({ row }) => {
      return <div>{row.getValue("title")}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <SortableHeader column={column} name="Created At" />
    ),
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue("created_at"));
      const dateB = new Date(rowB.getValue("created_at"));
      return dateA.getTime() - dateB.getTime();
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-center">{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "access_level",
    header: ({ column }) => <SortableHeader column={column} name="Access" />,
    sortingFn: (rowA, rowB) => {
      const valA = rowA.getValue("access_level") as AccessLevel;
      const valB = rowB.getValue("access_level") as AccessLevel;
      return valA - valB;
    },
    cell: ({ row }) => {
      const val = row.getValue("access_level");
      return (
        <div className="text-center">
          {val === AccessLevel.PRIVATE
            ? "Private"
            : val === AccessLevel.PUBLIC
              ? "Public"
              : "Unlisted"}
        </div>
      );
    },
  },
];
const ShaderTable = ({ data }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
  return (
    <div className="w-full flex flex-col gap-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No Data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="space-x-2">
        <Button
          onClick={() => table.previousPage()}
          variant="outline"
          size="sm"
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          onClick={() => table.nextPage()}
          variant="outline"
          size="sm"
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ShaderTable;
