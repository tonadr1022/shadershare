"use client";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog,
} from "@/components/ui/dialog";
import React from "react";
import { Button } from "../ui/button";
import { useDeleteShader } from "@/hooks/hooks";
import { useRouter } from "next/navigation";

type Props = {
  shaderId: string;
  children?: React.ReactNode;
  redirectUrl?: string;
};
const DeleteShaderDialog = ({ shaderId, children, redirectUrl }: Props) => {
  const router = useRouter();
  const deleteShaderMut = useDeleteShader(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this shader?
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => deleteShaderMut.mutate(shaderId)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShaderDialog;
