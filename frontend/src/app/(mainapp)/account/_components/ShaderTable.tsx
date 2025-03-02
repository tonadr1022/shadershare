import React, { useCallback, useState } from "react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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
import { assembleParams, useDeleteShader, useSortParams } from "@/hooks/hooks";
import { usePathname, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteShaderBulk } from "@/api/shader-api";
import { toast } from "sonner";

const SortableHeader = ({
  column,
  name,
  id,
}: {
  column: Column<ShaderMetadata, unknown>;
  name: string;
  id: string;
}) => {
  const { page, perPage, desc, sort, query } = useSortParams();
  const pathname = usePathname();
  const router = useRouter();

  const onSortChange = () => {
    let newDesc = false;
    let newSort = sort;
    if (sort !== null && sort !== "" && desc) {
      newSort = "";
    } else if (sort === null || sort === "" || sort !== id) {
      newSort = id;
      newDesc = false;
    } else {
      newDesc = !desc;
      newSort = id;
    }
    router.replace(
      `${pathname}?view=table&${assembleParams(page, perPage, newSort, newDesc, query)}`,
    );
  };

  return (
    <Button
      variant="ghost"
      onClick={onSortChange}
      className={cn(column.getIsSorted() && "text-primary")}
      title={
        !sort || id !== sort
          ? "Sort Ascending"
          : desc
            ? "Clear Sort"
            : "Sort Descending"
      }
    >
      {name}
      {!sort || id !== sort ? null : desc ? <ArrowUp /> : <ArrowDown />}
    </Button>
  );
};

const columns: ColumnDef<ShaderMetadata>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
    header: ({ column }) => (
      <SortableHeader id={"title"} column={column} name="Title" />
    ),
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
    header: ({ column }) => (
      <SortableHeader id={"created_at"} column={column} name="Created" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="">{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "access_level",
    header: () => <div>Access</div>,
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
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  const queryClient = useQueryClient();
  const deleteBulkMut = useMutation({
    mutationFn: deleteShaderBulk,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
      toast.success(`Deleted ${res.deleted_count} shaders.`);
      setRowSelection({});
    },
    onError: () => {
      toast.error("Failed to delete shaders.");
    },
  });

  return (
    <div>
      <div className="justify-end p-2 flex gap-2">
        <Button
          variant="destructive"
          onClick={() =>
            deleteBulkMut.mutate(
              table.getSelectedRowModel().rows.map((val) => val.original.id),
            )
          }
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Delete {table.getSelectedRowModel().rows.length} Shaders
        </Button>
      </div>
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
    </div>
  );
};

export default ShaderTable;
