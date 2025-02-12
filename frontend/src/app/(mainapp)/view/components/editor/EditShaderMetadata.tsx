import { Button } from "@/components/ui/button";
import React, { useCallback } from "react";
import { createRenderer, getScreenshotObjectURL } from "../renderer/Renderer";
import { RenderPass, ShaderData } from "@/types/shader";
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
import { createShader, updateShader } from "@/api/shader-api";
import { toastAxiosErrors } from "@/lib/utils";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

// TODO: move into renderer and check if things are dirty before screenshot preview
const getPreviewScreenshot = async (render_passes: RenderPass[]) => {
  const renderer = createRenderer();
  const canvas = document.createElement("canvas");
  renderer.initialize({
    canvas: canvas,
    renderData: render_passes,
  });
  renderer.onResize(320, 180);
  renderer.render({ checkResize: false });
  const screenshotDataURL = await getScreenshotObjectURL(canvas);
  renderer.shutdown();
  return screenshotDataURL;
};

type Props = {
  initialData?: ShaderData;
};

const EditShaderMetadata = ({ initialData }: Props) => {
  const { shaderDataRef } = useRendererCtx();
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
    mutationFn: createShader,
    onError: toastAxiosErrors,
    onSuccess: (data: ShaderData) => {
      queryClient.invalidateQueries({ queryKey: ["profile-shaders"] });
      router.push(`/view/${data.shader.id}`);
      // TODO: redirect to the id
    },
  });
  const updateShaderMut = useMutation({
    mutationFn: updateShader,
    onError: toastAxiosErrors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-shaders"] });
    },
  });
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      // TODO: preview img
      // const previewImg = await getPreviewScreenshot(
      //   shaderDataRef.current.render_passes,
      // );
      const payload = {
        id: "",
        title: values.title,
        description: values.description,
        // TODO: get dirty render passes
        render_passes: shaderDataRef.current.render_passes,
      };

      if (initialData?.shader.id) {
        payload.id = initialData.shader.id;
        updateShaderMut.mutate(payload);
      } else {
        createShaderMut.mutate(payload);
      }
    },
    [shaderDataRef, createShaderMut, updateShaderMut, initialData],
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
