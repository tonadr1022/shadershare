import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog,
} from "@/components/ui/dialog";
import { initialPlaylistData } from "@/types/shader";
import EditPlaylist from "@/app/(mainapp)/playlist/_components/EditPlaylist";
import { DialogDescription } from "@radix-ui/react-dialog";

type Props = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
const NewPlaylistDialog = ({ children, open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Shader Playlist</DialogTitle>
          <DialogDescription></DialogDescription>
          <EditPlaylist
            onSuccess={() => {
              if (onOpenChange) onOpenChange(false);
            }}
            initialData={initialPlaylistData}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default NewPlaylistDialog;
