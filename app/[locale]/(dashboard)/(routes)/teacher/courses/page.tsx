import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { db } from "@/lib/db";

import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";


const CoursesPage = async () => {
  const locale = await getLocale();
  const { userId } = auth();

  if (!userId) {
    return redirect({ href: "/", locale });
  }

  const courses = await db.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

    return (
      <div className="p-6">
         <DataTable columns={columns} data={courses} />
      </div>
    );
  }
  
  export default CoursesPage;