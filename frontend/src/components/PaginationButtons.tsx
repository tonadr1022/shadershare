"use client";
import React from "react";
import { Button } from "./ui/button";

type Props = {
  page: number;
  pageNumbers: number[];
  totalDataLength: number;
  onClick: (page: number) => void;
};
const PaginationButtons = ({
  page,
  pageNumbers,
  totalDataLength,
  onClick,
}: Props) => {
  return (
    <div className="flex flex-row gap-2">
      <Button
        variant="default"
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
            variant="default"
            disabled={num === page}
            onClick={() => onClick(num)}
          >
            {num}
          </Button>
        );
      })}
      <Button
        variant="default"
        disabled={
          totalDataLength === 0 || page === Math.ceil(totalDataLength / 10)
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
