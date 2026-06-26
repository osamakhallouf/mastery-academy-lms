import { db } from "@/lib/db";

export type TeacherBookingRow = {
  id: string;
  userId: string;
  courseId: string;
  courseRunId: string;
  status: string;
  createdAt: Date;
  course: { id: string; title: string };
  courseRun: {
    id: string;
    startDate: Date;
    endDate: Date | null;
    location: string | null;
    capacity: number | null;
  };
};

export async function getTeacherBookings(
  teacherUserId: string
): Promise<TeacherBookingRow[]> {
  const bookings = await db.booking.findMany({
    where: {
      course: { userId: teacherUserId },
    },
    include: {
      course: { select: { id: true, title: true } },
      courseRun: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          location: true,
          capacity: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return bookings as TeacherBookingRow[];
}
