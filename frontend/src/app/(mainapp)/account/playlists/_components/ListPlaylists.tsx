import { deletePlaylist, getPlaylists } from "@/api/shader-api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShaderPlaylist } from "@/types/shader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type Props = {
  userID: string;
  isUser: boolean;
};

const columns: ColumnDef<ShaderPlaylist>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <Button asChild variant="link">
          <Link href={`/playlist/${row.original.id}`}>
            {row.getValue("title")}
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="">{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "num_shaders",
    header: "Shaders",
    cell: ({ row }) => {
      return <div>{row.getValue("num_shaders")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionDropdown playlist={row.original} />,
  },
];

function ActionDropdown({ playlist }: { playlist: ShaderPlaylist }) {
  const queryClient = useQueryClient();
  const deleteShaderMut = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
  const handleDelete = useCallback(() => {
    deleteShaderMut.mutate(playlist.id);
  }, [deleteShaderMut, playlist.id]);
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

const ListPlaylists = ({ userID }: Props) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["playlists", userID],
    queryFn: () => getPlaylists(userID),
  });
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });
  return (
    <div className="max-w-4xl">
      {isPending ? (
        <Spinner />
      ) : isError || !data ? (
        <p>Error loading playlists.</p>
      ) : (
        <div className="w-full rounded-md border p-4">
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
                    No Playlists
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ListPlaylists;
