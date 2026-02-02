import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { isTeacher } from "@/lib/teacher";

const PostAuthPage = () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  if (isTeacher(userId)) {
    return redirect("/teacher/courses");
  }

  return redirect("/");
};

export default PostAuthPage;
