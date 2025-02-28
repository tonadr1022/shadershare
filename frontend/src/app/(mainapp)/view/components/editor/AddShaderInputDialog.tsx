import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useRendererCtx } from "@/context/RendererContext";
import {
  BufferName,
  BufferProps,
  ShaderInput,
  ShaderInputType,
  TextureProps,
} from "@/types/shader";
import { createShaderInput } from "@/api/shader-api";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

const formSchema = z.object({
  type: z.string(),
  url: z.string().optional(),
  buffer_name: z.string().optional(),
});
type Props = {
  onSave: (idx: number) => void;
  bufferName: BufferName;
  children: React.ReactNode;
};
const AddShaderInputDialog = ({ children, onSave, bufferName }: Props) => {
  const [open, setOpen] = useState(false);
  const { renderer, shaderDataRef } = useRendererCtx();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "texture",
      url: "https://dummyimage.com/64x64/ffffff/ffffff.png",
      buffer_name: "Buffer A",
    },
  });
  const afterCreateShaderInput = useCallback(
    (data: ShaderInput) => {
      if (!renderer) return;
      if (data.type === "buffer") {
        renderer.addBufferIChannel(
          bufferName,
          (data.properties as BufferProps).name,
          data.idx,
        );
      } else if (data.type === "texture") {
        renderer.addImageIChannel(
          data.url!,
          bufferName,
          data.idx,
          data.properties as TextureProps,
        );
      } else if (data.type === "keyboard") {
        renderer.addKeyboardIChannel(bufferName, data.idx);
      } else {
        throw new Error("invalid shader input type");
      }

      const output = shaderDataRef.current.shader_outputs.find(
        (out) => out.name === bufferName,
      );

      if (output) {
        if (!output.shader_inputs) {
          output.shader_inputs = [];
        }
        output.shader_inputs.push(data);
      }

      form.reset();
      setOpen(false);
    },
    [renderer, shaderDataRef, form, bufferName],
  );

  const createShaderInputMut = useMutation({
    mutationFn: createShaderInput,
    onError: (e) => {
      console.error("e", e);
      toast.error("Failed to create shader input");
    },
    onSuccess: (data) => {
      afterCreateShaderInput(data);
      onSave(data.idx);
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    if (!renderer) return;
    const output = shaderDataRef.current.shader_outputs.find(
      (out) => out.name === bufferName,
    );
    if (!output) {
      toast.error(
        "Failed to create shader input: no corresponding output to attach it to",
      );
      return;
    }

    const newInput: ShaderInput = {
      type: data.type as ShaderInputType,
      idx:
        shaderDataRef.current.shader_outputs.find(
          (out) => out.name === bufferName,
        )?.shader_inputs?.length || 0,
      properties: { name: "Buffer A" },
    };

    if (data.type === "texture") {
      newInput.url =
        data.url || "https://dummyimage.com/64x64/ffffff/ffffff.png";
      newInput.properties = {
        wrap: "repeat",
        filter: "linear",
        vflip: true,
      };
    } else if (data.type === "buffer") {
      const name = data.buffer_name as BufferName;
      newInput.properties = {
        name,
      };
      if (
        !shaderDataRef.current.shader_outputs.find((out) => out.name === name)
      ) {
        toast.error("Output not found for " + name);
        return;
      }
    } else if (data.type === "keyboard") {
      newInput.properties = {};
    } else {
      throw new Error("invalid type");
    }
    newInput.output_id = output.id;
    if (shaderDataRef.current.id) {
      newInput.shader_id = shaderDataRef.current.id;
      createShaderInputMut.mutate(newInput);
    } else {
      afterCreateShaderInput(newInput);
      onSave(newInput.idx);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425]px">
        <DialogHeader>
          <DialogTitle>Add Shader Input</DialogTitle>
          <DialogDescription>
            Inputs can be a 2D texture URL Buffer Output to read from, or the
            keyboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue id="type-select" />
                      </SelectTrigger>
                      <SelectContent defaultValue={"buffer"}>
                        <SelectItem value="texture">Texture</SelectItem>
                        <SelectItem value="buffer">Buffer</SelectItem>
                        <SelectItem value="keyboard">Keyboard</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => {
                if (form.watch("type") !== "texture") return <></>;
                return (
                  <FormItem>
                    <FormLabel>Texture URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="buffer_name"
              render={({ field }) => {
                if (form.watch("type") !== "buffer") return <></>;
                return (
                  <FormItem>
                    <FormLabel>Buffer</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue id="buffer-select" />
                        </SelectTrigger>
                        <SelectContent defaultValue={"Buffer A"}>
                          {shaderDataRef.current.shader_outputs.map((out) => {
                            if (out.type === "buffer") {
                              return (
                                <SelectItem value={out.name} key={out.name}>
                                  {out.name}
                                </SelectItem>
                              );
                            }
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <Button className="mx-auto block" type="submit" variant="default">
              Add
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddShaderInputDialog;
