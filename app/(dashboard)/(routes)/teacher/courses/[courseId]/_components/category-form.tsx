"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BaseSyntheticEvent, MouseEvent } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";

interface CategoryFormProps {
  initialData: Course;
  courseId: string;
  options: {
    label: string;
    value: string;
  }[];
}

const formSchema = z.object({
  categoryId: z.string().min(1),
});

const newCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const CategoryForm = ({
  initialData,
  courseId,
  options: initialOptions
}: CategoryFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [categories, setCategories] = useState(initialOptions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || ""
    },
  });

  const newCategoryForm = useForm<z.infer<typeof newCategorySchema>>({
    resolver: zodResolver(newCategorySchema),
    defaultValues: {
      name: ""
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const { isSubmitting: isAddingCategory } = newCategoryForm.formState;

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data;
      if (typeof d === "object" && d !== null && "error" in d && typeof (d as { error: unknown }).error === "string") {
        return (d as { error: string }).error;
      }
      if (typeof d === "string") return d;
    }
    return fallback;
  };

  const onSubmit = async (
    values: z.infer<typeof formSchema>,
    event?: BaseSyntheticEvent
  ) => {
    event?.preventDefault();
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Something went wrong"));
    }
  };

  const onAddCategory = async (e?: BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const values = newCategoryForm.getValues();
    const name = values.name.trim();
    
    
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    
    try {
      const response = await axios.post("/api/categories", { name });
      const newCategory = response.data;
      

      setCategories((prev) => [
        ...prev,
        { label: newCategory.name, value: newCategory.id },
      ]);

      form.setValue("categoryId", newCategory.id);
      newCategoryForm.reset();
      setIsAddingNew(false);
      toast.success("Category added successfully!");
      router.refresh();
    } catch (err) {
      console.error("[CategoryForm] add error:", err);
      toast.error(getErrorMessage(err, "Failed to add category"));
    }
  };

  const onDeleteCategory = async (
    categoryId: string,
    event?: MouseEvent<HTMLButtonElement>
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    
    try {
      setDeletingId(categoryId);
      await axios.delete("/api/categories", {
        data: { categoryId },
      });

      setCategories((prev) => prev.filter((cat) => cat.value !== categoryId));

      if (form.getValues("categoryId") === categoryId) {
        form.setValue("categoryId", "");
      }

      toast.success("Category deleted successfully!");
      router.refresh();
    } catch (err) {
      console.error("[CategoryForm] delete error:", err);
      toast.error(
        getErrorMessage(err, "Cannot delete category. It may be in use.")
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Check if the course already has a selected option.
  const selectedOption = categories.find(option => option.value === initialData.categoryId);

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4 dark:bg-gray-800">
      <div className="font-medium flex items-center justify-between">
        Course category
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit category
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p className={cn(
          "text-sm mt-2",
          !initialData.categoryId && "text-slate-500 italic"
        )}>
          {selectedOption?.label || "No category"}
        </p>
      )}
      {isEditing && (
        <div className="space-y-4 mt-4">
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                form.handleSubmit(onSubmit)(event);
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Combobox
                        options={categories}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Add New Category */}
              {!isAddingNew && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category
                </Button>
              )}

              {isAddingNew && (
                <div className="p-3 border rounded-md bg-white dark:bg-gray-900">
                  <div className="space-y-2">
                    <Input
                      placeholder="Category name"
                      value={newCategoryForm.watch("name")}
                      onChange={(e) => newCategoryForm.setValue("name", e.target.value)}
                      disabled={isAddingCategory}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddCategory();
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isAddingCategory}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddCategory();
                        }}
                      >
                        {isAddingCategory ? "Adding..." : "Add"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsAddingNew(false);
                          newCategoryForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories List with Delete */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Categories:</p>
                {categories.map((category) => (
                  <div
                    key={category.value}
                    className="flex items-center justify-between p-2 border rounded-md bg-white dark:bg-gray-900"
                  >
                    <span className="text-sm">{category.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(event) => onDeleteCategory(category.value, event)}
                      disabled={deletingId === category.value}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-x-2">
                <Button
                  disabled={!isValid || isSubmitting}
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}