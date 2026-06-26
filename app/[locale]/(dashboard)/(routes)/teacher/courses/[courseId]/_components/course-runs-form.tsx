"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import type { CourseRun } from "@prisma/client";

const formSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  capacity: z
    .union([z.coerce.number().int().min(0), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseRunsFormProps {
  courseId: string;
  initialRuns: CourseRun[];
}

export const CourseRunsForm = ({ courseId, initialRuns }: CourseRunsFormProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      location: "",
      capacity: undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      await axios.post(`/api/courses/${courseId}/runs`, {
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        location: values.location || undefined,
        capacity: values.capacity ?? undefined,
      });
      toast.success("Run added");
      form.reset({
        startDate: "",
        endDate: "",
        location: "",
        capacity: undefined,
      });
      setIsAdding(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onDelete = async (runId: string) => {
    try {
      setDeletingId(runId);
      await axios.delete(`/api/courses/${courseId}/runs/${runId}`);
      toast.success("Run removed");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <span className="flex items-center gap-x-2">
          <Calendar className="h-5 w-5" />
          Course Schedule
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding((c) => !c)}
        >
          {isAdding ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> Add run</>}
        </Button>
      </div>

      {isAdding && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location / City (optional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g. Dubai, Online"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        disabled={isSubmitting}
                        placeholder="e.g. 25"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-x-2">
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Add run
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}

      {initialRuns.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-slate-700">Scheduled runs</p>
          <ul className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-200">
            {initialRuns.map((run) => (
              <li
                key={run.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-medium">
                    {format(new Date(run.startDate), "dd MMM yyyy")}
                    {run.endDate
                      ? ` – ${format(new Date(run.endDate), "dd MMM yyyy")}`
                      : ""}
                  </span>
                  {run.location && (
                    <span className="text-slate-600">{run.location}</span>
                  )}
                  {run.capacity != null && (
                    <span className="text-slate-500">
                      Capacity: {run.capacity}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      run.status === "draft"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={deletingId === run.id}
                  onClick={() => onDelete(run.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {initialRuns.length === 0 && !isAdding && (
        <p className="text-sm text-slate-500 mt-2">
          No runs yet. Click &quot;Add run&quot; to add a schedule.
        </p>
      )}
    </div>
  );
};
