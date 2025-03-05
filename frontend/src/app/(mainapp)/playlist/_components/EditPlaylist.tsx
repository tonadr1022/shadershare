"use client";
import { createShaderPlaylist } from "@/api/shader-api";
import { toastAxiosErrors } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AccessLevel, ShaderPlaylist } from "@/types/shader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .max(50, { message: "Title must be at most 50 characters" }),
  description: z
    .string()
    .max(1000, { message: "Description must be at most 500 characters" })
    .optional(),
  tags: z.string(),
  access_level: z.string(),
});

type Props = {
  initialData: ShaderPlaylist;
};
const EditPlaylist = ({ initialData }: Props) => {
  let accessLevel = AccessLevel.PRIVATE;
  if (initialData) {
    accessLevel = initialData.access_level;
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: initialData?.tags.join(" ") || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      access_level: accessLevel.toString(),
    },
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const createMut = useMutation({
    mutationFn: createShaderPlaylist,
    onError: toastAxiosErrors,
    onSuccess: (playlist) => {
      queryClient.invalidateQueries({ queryKey: ["shaders", playlist.id] });
      router.push(`/playlist/view/${playlist.id}`);
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      createMut.mutate({
        access_level: parseInt(values.access_level) as AccessLevel,
        title: values.title,
        description: values.description,
        tags: values.tags.trim().split(" "),
      });
    },
    [createMut],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-4 px-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Name of your playlist."
                  className="w-96"
                  maxLength={50}
                  minLength={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Description of your playlist."
                  rows={6}
                  maxLength={1000}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Tags for search."
                  className="w-96"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="access_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Level</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={AccessLevel.PRIVATE.toString()}>
                        Private
                      </SelectItem>
                      <SelectItem value={AccessLevel.PUBLIC.toString()}>
                        Public
                      </SelectItem>
                      <SelectItem value={AccessLevel.UNLISTED.toString()}>
                        Unlisted
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            className=""
            type="submit"
            variant="default"
            disabled={createMut.isPending || createMut.isPending}
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditPlaylist;
