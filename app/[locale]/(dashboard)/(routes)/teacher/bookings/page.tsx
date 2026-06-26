import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

export default async function TeacherBookingsPage() {
  const locale = await getLocale();
  return redirect({ href: "/teacher/corporate-inquiries", locale });
}
