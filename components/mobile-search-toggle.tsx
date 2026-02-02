"use client";

import { Search } from "lucide-react";

import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const MobileSearchToggle = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <SearchInput />
      </PopoverContent>
    </Popover>
  );
};
