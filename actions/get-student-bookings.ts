import { db } from "@/lib/db";

export type StudentBookingItem = {
  id: string;
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

export async function getStudentBookings(
  userId: string
): Promise<StudentBookingItem[]> {
  const bookings = await db.booking.findMany({
    where: { userId },
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
  return bookings as StudentBookingItem[];
}
