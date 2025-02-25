import React, { useCallback, useState } from "react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteShader } from "@/hooks/hooks";

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
            <Link href={`/view/${row.original.id}`}>
              <Image
                width={320}
                height={180}
                alt="preview"
                src={previewImgUrl}
              />
            </Link>
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
      return (
        <Button asChild variant="link">
          <Link href={`/view/${row.original.id}`}>{row.getValue("title")}</Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader column={column} name="Created" />,
    sortingFn: (rowA, rowB) => {
      return (
        new Date(rowA.getValue("created_at")).getTime() -
        new Date(rowB.getValue("created_at")).getTime()
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="">{date.toLocaleString()}</div>;
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
        <div className="">
          {val === AccessLevel.PRIVATE
            ? "Private"
            : val === AccessLevel.PUBLIC
              ? "Public"
              : "Unlisted"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionDropdown shader={row.original} />,
  },
];

function ActionDropdown({ shader }: { shader: ShaderMetadata }) {
  const deleteShaderMut = useDeleteShader();
  const handleDelete = useCallback(() => {
    deleteShaderMut.mutate(shader.id);
  }, [deleteShaderMut, shader.id]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type Props = {
  data: ShaderMetadata[];
};
const ShaderTable = ({ data }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-none">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="border-none">
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
                <TableCell key={cell.id} className="border-none">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No Shaders...{"  "}
              <Button
                asChild
                variant="link"
                className="p-0 h-auto text-primary"
              >
                <Link href="/new">Create one!</Link>
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ShaderTable;
