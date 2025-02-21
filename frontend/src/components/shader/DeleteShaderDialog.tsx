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
import React, { useCallback } from "react";
import { Button } from "../ui/button";
import { useDeleteShader } from "@/hooks/hooks";
import { useRouter } from "next/navigation";

type Props = {
  shaderId: string;
  children?: React.ReactNode;
  redirectUrl?: string;
  onClose?: () => void;
};
const DeleteShaderDialog = ({
  shaderId,
  onClose,
  children,
  redirectUrl,
}: Props) => {
  const router = useRouter();
  const deleteShaderMut = useDeleteShader(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
    setIsOpen(false);
    onClose?.();
  });
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDelete = useCallback(() => {
    deleteShaderMut.mutate(shaderId);
  }, [deleteShaderMut, shaderId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this shader?
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShaderDialog;
