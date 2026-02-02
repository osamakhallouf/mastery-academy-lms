"use client";

import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import StarRating from "@/components/StarRating/StarRating";

interface CourseProgressButtonProps {
  chapterId: string;
  courseId: string;
  userId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
}

export const CourseProgressButton = ({
  chapterId,
  courseId,
  userId,
  isCompleted = false,
  nextChapterId,
}: CourseProgressButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await axios.get(`/api/ratings?courseId=${courseId}&userId=${userId}`);
        if (response.data && response.data.rating !== undefined) {
          setRating(response.data.rating);
        }
      } catch (error) {
        console.error('Failed to fetch rating:', error);
      }
    };

    fetchRating();
  }, [courseId, userId]);

  const onClick = async () => {
    try {
      setIsLoading(true);

      await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
        isCompleted: !isCompleted,
      });

      if (!isCompleted && !nextChapterId) {
        confetti.onOpen();
      }

      if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }

      toast.success("Progress updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const contactAdmin = () => {
    window.location.href = "mailto:admin@example.com";
  };

  const Icon = isCompleted ? XCircle : CheckCircle;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="flex items-center">
        <StarRating courseId={courseId} initialRating={rating} userId={userId} />
      </div>

      <Button
        onClick={onClick}
        disabled={isLoading}
        type="button"
        variant={isCompleted ? "outline" : "success"}
        className="w-full md:w-auto"
      >
        {isCompleted ? "Not completed" : "Mark as complete"}
        <Icon className="h-4 w-4 ml-2" />
      </Button>

      <div className="flex-shrink-0">
        <Button
          onClick={contactAdmin}
          variant="outline"
          size="sm"
          className="w-full md:w-auto"
        >
          Contact us
        </Button>
      </div>
    </div>
  );
};
