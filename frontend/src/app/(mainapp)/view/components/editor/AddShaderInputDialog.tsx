import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { BufferName, ShaderInput, ShaderInputType } from "@/types/shader";
import { Plus } from "lucide-react";
import { createShaderInput } from "@/api/shader-api";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

const formSchema = z.object({
  type: z.string(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  url: z.string().optional(),
});
type Props = {
  onSave: (idx: number) => void;
};
const AddShaderInputDialog = ({ onSave }: Props) => {
  const [open, setOpen] = useState(false);
  const { renderer, shaderDataRef } = useRendererCtx();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "texture",
      name: "ShaderInput",
      url: "https://dummyimage.com/64x64/ffffff/ffffff.png",
    },
  });
  const afterCreateShaderInput = useCallback(
    (data: ShaderInput) => {
      if (!renderer) return;
      if (data.type === "buffer") {
        renderer.addBufferIChannel(data.name as BufferName, data.idx);
      } else if (data.type === "texture") {
        renderer.addImageIChannel(data.url!, data.idx, data.properties);
      } else {
        throw new Error("invalid shader input type");
      }
      shaderDataRef.current.shader_inputs.push(data);
      form.reset();
      setOpen(false);
    },
    [form, shaderDataRef, renderer],
  );

  const createShaderInputMut = useMutation({
    mutationFn: createShaderInput,
    onError: () => {
      toast.error("Failed to create shader output");
    },
    onSuccess: (data) => {
      afterCreateShaderInput(data);
      onSave(data.idx);
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    if (!renderer) return;
    const newInput: ShaderInput = {
      type: data.type as ShaderInputType,
      name: data.name,
      idx: shaderDataRef.current.shader_inputs.length,
    };
    if (data.type === "texture") {
      newInput.url = "https://dummyimage.com/64x64/ffffff/ffffff.png";
      newInput.properties = {
        wrap: "repeat",
        filter: "linear",
        vflip: true,
      };
    } else {
      throw new Error("invalid type");
    }
    if (shaderDataRef.current.shader.id) {
      newInput.shader_id = shaderDataRef.current.shader.id;
      createShaderInputMut.mutate(newInput);
    } else {
      afterCreateShaderInput(newInput);
      onSave(newInput.idx);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425]px">
        <DialogHeader>
          <DialogTitle>Add Shader Input</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
