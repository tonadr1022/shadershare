import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback } from "react";
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
import { ShaderInput, ShaderInputType } from "@/types/shader";

const formSchema = z.object({
  type: z.string(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});
const AddShaderInputDialog = () => {
  const { shaderDataRef } = useRendererCtx();
  // type, name
  const handleAddInput = useCallback(() => {}, []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "buffer",
      name: "New Input",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const newInput: ShaderInput = {
      type: data.type as ShaderInputType,
      name: data.name,
      idx: shaderDataRef.current.shader_inputs.length,
    };
    if (data.type === "buffer") {
    } else if (data.type === "texture") {
    } else {
      throw new Error("invalid type");
    }

    toast.success("Input added" + data.name);
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={handleAddInput} variant="default">
          add input
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425]px">
        <DialogHeader>
          <DialogTitle>Add Input</DialogTitle>
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
