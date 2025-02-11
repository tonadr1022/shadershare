import { Button } from "@/components/ui/button";
import React, { useCallback } from "react";
import { createRenderer, getScreenshotObjectURL } from "../renderer/Renderer";
import { RenderPass } from "@/types/shader";
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
import { useMutation } from "@tanstack/react-query";
import { createShader } from "@/api/shader-api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/base";

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

const EditShaderMetadata = () => {
  const { shaderDataRef } = useRendererCtx();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: shaderDataRef.current.title,
      description: shaderDataRef.current.description || "",
    },
  });

  const createShaderMut = useMutation({
    mutationFn: createShader,
    onError: (error: AxiosError) => {
      const errs = (error.response?.data as ErrorResponse)?.errors || [];
      for (const err of errs) {
        toast.error("Error: " + err);
      }
    },
  });
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      // TODO: preview img
      // const previewImg = await getPreviewScreenshot(
      //   shaderDataRef.current.render_passes,
      // );
      const payload = {
        title: values.title,
        description: values.description,
        render_passes: shaderDataRef.current.render_passes,
      };
      // console.log(values, shaderDataRef.current.render_passes[0].code);
      createShaderMut.mutate(payload);
    },
    [shaderDataRef, createShaderMut],
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
          type="submit"
          variant="default"
          disabled={createShaderMut.isPending}
        >
          Save
        </Button>
      </form>
    </Form>
  );
};

export default EditShaderMetadata;
