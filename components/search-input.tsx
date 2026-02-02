"use client";
import qs from "query-string";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchParams, usePathname, useRouter } from "next/navigation";


export const SearchInput = () => {

    const [value, setValue] = useState("");
    const debouncedValue = useDebounce(value, 500);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    
    const currentCategoryId = searchParams.get("categoryId");

    useEffect(() => {
        const url = qs.stringifyUrl({
            url: pathname,
            query: {
                title: debouncedValue,
                categoryId: currentCategoryId,
            }
        }, { skipNull: true, skipEmptyString: true });
        router.push(url);
    }, [debouncedValue, currentCategoryId, router, pathname]);

    return (
        <div className="relative">
            <Search className="h-4 w-4 top-3 absolute left-3 text-[#d4af37]" />
            <Input 
                onChange = {(e) => setValue(e.target.value)}
                value={value}
                className="w-full md:w-[300px] pl-9 rounded-full bg-[#1e293b] text-white placeholder:text-slate-300 border border-white/10 focus-visible:ring-[#d4af37]"
                placeholder="Search for courses"
            />
        </div>
    )
}