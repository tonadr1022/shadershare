"use client";
import { updateUser } from "@/api/auth-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { User } from "@/types/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

type Props = {
  user: User;
};
const UpdateProfileDialog = ({ user: existingUser }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: existingUser.username,
    },
  });

  const queryClient = useQueryClient();
  const updateUserMut = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
      toast.success("Profile updated!" + data.username);
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      updateUserMut.mutate({
        username: values.username,
      });
    },
    [updateUserMut],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="w-fit">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update your profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your display username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className=""
              type="submit"
              variant="default"
              disabled={updateUserMut.isPending}
            >
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
