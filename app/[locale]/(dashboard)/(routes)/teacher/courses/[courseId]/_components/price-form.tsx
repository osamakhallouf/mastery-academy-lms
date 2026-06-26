"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
import { Course } from "@prisma/client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";




interface PriceFromProps {
    initalData: Course;
    courseId: string;
};
const formSchma = z.object({
    price: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
});

export const PriceFrom  = ({
    initalData,
    courseId,
}: PriceFromProps ) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const toggleEdit = () => setIsEditing((current) => !current);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchma>>({
    resolver: zodResolver(formSchma),
    defaultValues:{
        price: (initalData?.price != null && initalData.price > 0) ? initalData.price : "",
    },
  });
 const { isSubmitting } = form.formState;
 const onSubmit = async (values: z.infer<typeof formSchma>) => {
    try{
        const price = values.price === "" || values.price == null ? null : Number(values.price);
        await axios.patch(`/api/courses/${courseId}` , { price });
        toast.success("Course updated");
        toggleEdit();
        router.refresh();
    } catch{
        toast.error("Something went wrong");
    }

}
    return ( 
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course price (optional)
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                         <Pencil className="h-4 w-4 mr-2" />
                            Edit price
                        </>
                    )}

                </Button>
            </div>
            {!isEditing && (
                <p className={cn(
                    "text-sm mt-2",
                    (initalData.price == null || initalData.price === 0) && "text-slate-500 italic"
                )}>
                    {(initalData.price != null && initalData.price > 0)
                        ? formatPrice(initalData.price)
                        : "No price set"
                    }
                </p>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 mt-4"
                    >
                        <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Input
                                type="number"
                                step="0.01"
                                min={0}
                                disabled={isSubmitting}
                                placeholder="Optional — leave empty for corporate-only"
                                {...field}
                                value={field.value === undefined || field.value === null || field.value === "" ? "" : String(field.value)}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage/>
                            </FormItem>
                        )}
                        />
                        <div className="flex items-center gap-x-2">
                        <Button 
                        disabled={isSubmitting}
                         type="submit"
                        >
                            Save
                        </Button>
                        </div>
                    </form>
                    

                </Form>
            )   
            }
        </div>

     )
}
 