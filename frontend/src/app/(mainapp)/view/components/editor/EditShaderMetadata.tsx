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
import { toastAxiosErrors } from "@/lib/utils";
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

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  access_level: z.string(),
});

type Props = {
  initialData?: ShaderData;
};

const EditShaderMetadata = ({ initialData }: Props) => {
  const { shaderDataRef, codeDirtyRef, renderer, shaderDataDirty } =
    useRendererCtx();
  const router = useRouter();

  let accessLevel = AccessLevel.PRIVATE;
  if (initialData) {
    accessLevel = initialData.shader.access_level;
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.shader.title || "",
      description: initialData?.shader.description || "",
      access_level: accessLevel.toString(),
    },
  });

  const queryClient = useQueryClient();
  const createShaderMut = useMutation({
    mutationFn: createShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: (data: ShaderData) => {
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
      router.push(`/view/${data.shader.id}`);
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
      const res = renderer!.setShaders(shaderDataRef.current.shader_outputs);

      if (res.error) {
        toast.error("Cannot save, shader has errors. Compile to see them");
        return;
      }

      const isUpdate = initialData?.shader.id;

      const payload: ShaderUpdateCreatePayload = {
        title: values.title,
        description: values.description,
      };
      if (isUpdate) {
        payload.id = initialData.shader.id;
        payload.user_id = initialData.shader.user_id;
        const dirtyRenderPasses = shaderDataRef.current.shader_outputs.filter(
          (output) => codeDirtyRef.current.get(output.name),
        );
        if (dirtyRenderPasses.length > 0) {
          payload.shader_outputs = dirtyRenderPasses;
        }
      } else {
        payload.shader_outputs = shaderDataRef.current.shader_outputs;
        payload.shader_inputs = shaderDataRef.current.shader_inputs;
      }
      // TODO: check images etc
      const shaderDirty =
        shaderDataDirty ||
        codeDirtyRef.current.values().some((val: boolean) => val);

      // TODO: partial update
      payload.shader_inputs = shaderDataRef.current.shader_inputs;

      let previewFile: File | null = null;
      const needNewPreview = (shaderDirty && isUpdate) || !isUpdate;
      if (shaderDirty && isUpdate) {
        payload.preview_img_url = initialData.shader.preview_img_url;
      }

      if (needNewPreview) {
        previewFile = await getPreviewImgFile(shaderDataRef.current);
        if (previewFile == null) {
          toast.error("Failed to generate preview image");
          return;
        }
      }

      // TODO: invalidate queries for browse?
      payload.access_level = parseInt(values.access_level) as AccessLevel;
      if (isUpdate) {
        updateShaderMut.mutate({ data: payload, previewFile: previewFile });
      } else {
        createShaderMut.mutate({ data: payload, previewFile: previewFile! });
      }
    },
    [
      shaderDataDirty,
      renderer,
      codeDirtyRef,
      shaderDataRef,
      createShaderMut,
      updateShaderMut,
      initialData,
    ],
  );

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Name your shader here." />
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
                  />
                </FormControl>
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
          <Button
            className="mx-auto block"
            type="submit"
            variant="default"
            disabled={createShaderMut.isPending || updateShaderMut.isPending}
          >
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditShaderMetadata;
