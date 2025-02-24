"use client";
import React from "react";
import { Button } from "./ui/button";
import { generatePagination } from "@/lib/utils";

type Props = {
  page: number;
  totalDataLength: number;
  perPage: number;
  onClick: (page: number) => void;
};
const PaginationButtons = ({
  page,
  totalDataLength,
  perPage,
  onClick,
}: Props) => {
  const pageNumbers = generatePagination(
    page,
    Math.ceil(totalDataLength / perPage),
  );
  return (
    <div className="flex flex-row gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onClick(page - 1)}
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
            onClick={() => onClick(num)}
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
          onClick(page + 1);
        }}
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationButtons;
