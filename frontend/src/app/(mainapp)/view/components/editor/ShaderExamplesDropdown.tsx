import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Examples } from "@/rendering/example-shaders";
import { ShaderData } from "@/types/shader";

type Props = {
  onSelect: (shader: ShaderData) => void;
};
const ShaderExamplesDropdown = ({ onSelect }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="transition-none" asChild>
        <Button>Examples</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="transition-none mr-4 ">
        {Object.entries(Examples).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => {
              onSelect(value);
            }}
          >
            {value.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShaderExamplesDropdown;
