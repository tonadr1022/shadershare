import React from "react";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AccessLevel = () => {
  return (
    <FormItem>
      <FormLabel>Access Level</FormLabel>
      <FormControl>
        <Select {...field} onValueChange={field.onChange} value={field.value}>
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
  );
};

export default AccessLevel;
