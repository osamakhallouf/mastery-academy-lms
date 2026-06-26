import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

const TeacherLayout = async ({
    children
}:{
    children: React.ReactNode;
}) => {
    const locale = await getLocale();
    const { userId } = auth();

    if (!isTeacher(userId)) {
        return redirect({ href: "/", locale });
    }

    return<>{children}</>
}

export default TeacherLayout;