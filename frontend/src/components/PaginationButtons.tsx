"use client";
import React from "react";
import { Button } from "./ui/button";
import { generatePagination } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  page: number;
  totalDataLength: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (newPage: number, newPerPage: number) => void;
  pageSizes?: number[];
};

const PaginationButtons = ({
  page,
  totalDataLength,
  perPage,
  onPageChange,
  onPerPageChange,
  pageSizes,
}: Props) => {
  const sizes = pageSizes ? pageSizes : [10, 25, 50];
  const pageNumbers = generatePagination(
    page,
    Math.ceil(totalDataLength / perPage),
  );

  return (
    <div className="flex flex-row gap-2">
      <Select
        value={perPage.toString()}
        onValueChange={(val: string) => {
          const newPerPage = parseInt(val);
          let newPage = page;
          if (newPerPage * page > totalDataLength) {
            newPage = Math.ceil(totalDataLength / newPerPage);
          }
          onPerPageChange(newPage, newPerPage);
        }}
      >
        <SelectTrigger className="w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((p) => (
            <SelectItem key={p} value={p.toString()}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>
      {pageNumbers.map((num) => {
        if (num < 0) {
          return (
            <p key={num} className="text-center w-6">
              {" "}
              ...{" "}
            </p>
          );
        }
        return (
          <Button
            key={num}
            variant="outline"
            size="sm"
            disabled={num === page}
            onClick={() => onPageChange(num)}
          >
            {num}
          </Button>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        disabled={
          totalDataLength === 0 || page === Math.ceil(totalDataLength / perPage)
        }
        onClick={() => {
          onPageChange(page + 1);
        }}
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationButtons;
