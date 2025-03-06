"use client";
import { getPlaylist, playlistRemoveShaders } from "@/api/shader-api";
import ShaderPreviewCards from "@/components/ShaderPreviewCards";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ShaderMetadata } from "@/types/shader";
import {
  previewImgColumnDef,
  selectColumnDef,
  titleColumnDef,
} from "@/app/(mainapp)/account/_components/ShaderTable";
const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const getUrl = useCallback(
    (view: string) => {
      return `/playlist/${id}?view=${view}`;
    },
    [id],
  );
  const playlistQuery = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => getPlaylist(id, true),
  });

  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "card";
  const router = useRouter();

  const isError = playlistQuery.isError;
  const playlist = playlistQuery.data;
  const [page, setPage] = useState(0);
  const perPage = 24;
  const maxPage = Math.ceil((playlist?.shaders?.length || 0) / 24) - 1;
  const visibleShaders = playlist?.shaders?.slice(
    page * perPage,
    page * perPage + perPage,
  );

  console.log(playlist);
  return (
    <div className="flex p-4">
      {playlistQuery.isPending ? (
        <Spinner />
      ) : isError ? (
        <p>Error.</p>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4">
            <h1>{playlist?.title}</h1>
          </div>
          <p className="font-semibold">By {playlist?.username}</p>
          <p>{playlist?.description}</p>

          <Tabs
            value={view}
            onValueChange={(view: string) => router.push(getUrl(view))}
          >
            <div className="flex gap-2 items-center">
              <TabsList>
                <TabsTrigger value="card">Card</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage((page) => page - 1)}
                  variant="secondary"
                  disabled={!playlist?.shaders || page === 0}
                >
                  Prev
                </Button>
                <Button
                  onClick={() => setPage((page) => page + 1)}
                  variant="secondary"
                  disabled={!playlist?.shaders || page === maxPage}
                >
                  Next
                </Button>
              </div>
              {playlist?.shaders?.length ? (
                <p className="font-semibold">
                  (page {page + 1} of {maxPage + 1}){" "}
                  {playlist?.shaders?.length || "0"} shaders
                </p>
              ) : (
                <></>
              )}
            </div>
            <TabsContent value="table">
              <div className="w-full rounded-md border p-4">
                <PlaylistShaderTable
                  playlistID={playlist?.id || ""}
                  shaders={visibleShaders || []}
                />
              </div>
            </TabsContent>
            <TabsContent value="card" className="w-full">
              {visibleShaders?.length ? (
                <ShaderPreviewCards
                  show={{ usernames: false }}
                  data={visibleShaders}
                />
              ) : (
                <p className="pt-4">No shaders in this playlist.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

const columns: ColumnDef<ShaderMetadata>[] = [
  selectColumnDef,
  previewImgColumnDef,
  titleColumnDef,
];
const PlaylistShaderTable = ({
  playlistID,
  shaders,
}: {
  playlistID: string;
  shaders: ShaderMetadata[];
}) => {
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data: shaders,
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
    mutationFn: playlistRemoveShaders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistID] });
      setRowSelection({});
    },
  });
  return (
    <>
      <div>
        <Button
          variant="destructive"
          onClick={() =>
            deleteBulkMut.mutate({
              ids: table
                .getSelectedRowModel()
                .rows.map((val) => val.original.id),
              playlistID,
            })
          }
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          Remove
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
                No Shaders in this playlist.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default PlaylistPage;
