import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";



interface SearchPageProps {
  searchParams: {
    title?: string;
    cateogoryId?: string;
    page?: string;
    limit?: string;
  };
}


const SearchPage  = async ({
    searchParams
}: SearchPageProps) => {
    const { userId } = auth();
    if (!userId) {
        return redirect("/");
     }
    const categories = await db.category.findMany({
        orderBy: {
            name: "asc"
        }
    });
    const { courses, total, hasMore } = await getCourses({
      userId,
      title: searchParams.title,
      categoryId: searchParams.cateogoryId,
      page: searchParams.page ? Number(searchParams.page) : undefined,
      limit: searchParams.limit ? Number(searchParams.limit) : undefined,
    });

    return (
      <>
        <div className="px-6 pt-6 md:hidden md:mb-0 block">
          <SearchInput />
        </div>
        <div className="p-6 space-y-4">
          <Categories items={categories} />
          <CoursesList items={courses} />
        </div>
      </>
    );
}
 
export default SearchPage ;