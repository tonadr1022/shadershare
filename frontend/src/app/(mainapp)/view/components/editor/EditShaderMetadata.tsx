import { Button } from "@/components/ui/button";
import React, { useCallback } from "react";
import { createRenderer } from "../renderer/Renderer";
import { ShaderData, ShaderUpdateCreatePayload } from "@/types/shader";
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

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type Props = {
  initialData?: ShaderData;
};

const EditShaderMetadata = ({ initialData }: Props) => {
  const { shaderDataRef, codeDirtyRef } = useRendererCtx();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.shader.title || "",
      description: initialData?.shader.description || "",
    },
  });

  const queryClient = useQueryClient();
  const createShaderMut = useMutation({
    mutationFn: createShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: (data: ShaderData) => {
      queryClient.invalidateQueries({ queryKey: ["shaders", "profile"] });
      router.push(`/view/${data.shader.id}`);
    },
  });

  const updateShaderMut = useMutation({
    mutationFn: updateShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shaders", "profile"] });
      toast.success("Shader saved successfully");
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      // get preview image
      const getPreviewImgFile = async (): Promise<File | null> => {
        // delay by 100ms
        // await new Promise((resolve) => setTimeout(resolve, 100));

        return new Promise((resolve) => {
          const renderer = createRenderer();
          const canvas = document.createElement("canvas");
          renderer.initialize({
            canvas: canvas,
            renderData: shaderDataRef.current.render_passes,
          });
          renderer.onResize(320, 180);
          renderer.render({ checkResize: false });
          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            const file = new File([blob], "preview.png", {
              type: "image/png",
            });
            resolve(file);
          });
          renderer.shutdown();
        });
      };

      const isUpdate = initialData?.shader.id;

      const payload: ShaderUpdateCreatePayload = {
        title: values.title,
        description: values.description,
      };
      if (isUpdate) {
        payload.id = initialData.shader.id;
        payload.user_id = initialData.shader.user_id;
        payload.preview_img_url = initialData.shader.preview_img_url;
        const dirtyRenderPasses = shaderDataRef.current.render_passes.filter(
          (_, idx) => codeDirtyRef.current[idx],
        );
        if (dirtyRenderPasses.length > 0) {
          console.log(dirtyRenderPasses);
          payload.render_passes = dirtyRenderPasses;
        }
      } else {
        payload.render_passes = shaderDataRef.current.render_passes;
      }
      const previewFile = await getPreviewImgFile();
      if (!previewFile) {
        toast.error("Failed to generate preview image");
        return;
      }
      if (isUpdate) {
        updateShaderMut.mutate({ data: payload, previewFile: previewFile });
      } else {
        createShaderMut.mutate({ data: payload, previewFile: previewFile });
      }
    },
    [
      codeDirtyRef,
      shaderDataRef,
      createShaderMut,
      updateShaderMut,
      initialData,
    ],
  );

  return (
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
                <Textarea {...field} placeholder="Describe your shader here." />
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
  );
};

export default EditShaderMetadata;
