import { Button } from "@/components/ui/button";
import React, { useCallback } from "react";
import { getPreviewImgFile } from "../renderer/Renderer";
import {
  AccessLevel,
  ShaderData,
  shaderOutputNames,
  ShaderUpdateCreatePayload,
} from "@/types/shader";
import { useRendererCtx } from "@/context/RendererContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShaderWithPreview,
  updateShaderWithPreview,
} from "@/api/shader-api";
import { deepCopy, toastAxiosErrors } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import DeleteShaderDialog from "@/components/shader/DeleteShaderDialog";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  tags: z.string(),
  access_level: z.string(),
});

type Props = {
  initialData?: ShaderData;
};

const EditShaderMetadata = ({ initialData }: Props) => {
  const { editState, shaderDataRef, codeDirtyRef, renderer, shaderDataDirty } =
    useRendererCtx();
  const router = useRouter();

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
  const createShaderMut = useMutation({
    mutationFn: createShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["shaders", data.id] });
      router.push(`/view/${data.id}`);
    },
  });

  const updateShaderMut = useMutation({
    mutationFn: updateShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
      toast.success("Shader saved successfully");
      for (const name of shaderOutputNames) {
        codeDirtyRef.current.set(name, false);
      }
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      // if not able to compile, can't save it
      if (!renderer) {
        toast.error("Failed to save, renderer not initialized");
        return;
      }
      const res = await renderer!.compileShaders(
        shaderDataRef.current.shader_outputs,
        false,
      );

      if (res.error) {
        toast.error("Cannot save, shader has errors. Compile to see them");
        return;
      }

      const isUpdate = initialData?.id;

      const payload: ShaderUpdateCreatePayload = {
        title: values.title,
        flags: initialData?.flags || 0,
        description: values.description,
        tags: values.tags.trim().split(" "),
      };
      // deleted inputs and outputs
      // TODO: outputs
      if (editState.current.deletedInputIds.length) {
        payload.deleted_input_ids = editState.current.deletedInputIds;
      }

      if (isUpdate) {
        payload.id = initialData.id;
        payload.user_id = initialData.user_id;
      }
      // TODO: check images etc
      let shaderDirty =
        shaderDataDirty ||
        codeDirtyRef.current.values().some((val: boolean) => val);
      // get the outputs that have dirty inputs or are dirty themselves
      payload.shader_outputs = deepCopy(shaderDataRef.current.shader_outputs);

      if (isUpdate) {
        for (const out of payload.shader_outputs) {
          if (!out.shader_inputs) {
            out.shader_inputs = [];
          }
          out.shader_inputs = out.shader_inputs.filter(
            (inp) => inp.dirty || inp.new,
          );
          shaderDirty = shaderDirty || out.shader_inputs.length > 0;
        }
        payload.shader_outputs = payload.shader_outputs.filter((out) => {
          if (codeDirtyRef.current.get(out.name)) {
            return true;
          }

          let hasDirtyInput = false;
          for (const inp of out.shader_inputs!) {
            if (inp.dirty || inp.new) {
              hasDirtyInput = true;
              break;
            }
          }
          if (hasDirtyInput) {
            return true;
          }
          return false;
        });
        shaderDirty = shaderDirty || payload.shader_outputs.length > 0;
      }

      let previewFile: File | null = null;
      const needNewPreview = (shaderDirty && isUpdate) || !isUpdate;
      if (shaderDirty && isUpdate) {
        payload.preview_img_url = initialData.preview_img_url;
      }
      if (needNewPreview) {
        previewFile = await getPreviewImgFile(shaderDataRef.current);
        if (previewFile == null) {
          toast.error("Failed to generate preview image");
          return;
        }
      }
      payload.access_level = parseInt(values.access_level) as AccessLevel;
      if (isUpdate) {
        updateShaderMut.mutate({ data: payload, previewFile: previewFile });
      } else {
        createShaderMut.mutate({ shader: payload, previewFile: previewFile! });
      }
    },
    [
      renderer,
      shaderDataRef,
      initialData,
      editState,
      shaderDataDirty,
      codeDirtyRef,
      updateShaderMut,
      createShaderMut,
    ],
  );

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Name your shader here."
                    className="w-96"
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
                    placeholder="Describe your shader here."
                    rows={6}
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
                    placeholder="Add tags for search."
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
            <DeleteShaderDialog
              shaderId={shaderDataRef.current.id}
              redirectUrl="/"
            >
              <Button variant="destructive">
                <Trash />
              </Button>
            </DeleteShaderDialog>
            <Button
              className=""
              type="submit"
              variant="default"
              disabled={createShaderMut.isPending || updateShaderMut.isPending}
            >
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditShaderMetadata;
