import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";

export async function POST(
    req: Request,    
) {
    try {
        const { userId } = auth();
        const { title, author } = await req.json();

        if (!userId || !isTeacher(userId)) {
            return apiError("Unauthorized", 401);
        }
        
        const course = await db.course.create({
            data: {
                userId,
                title,
                author,
            }
        });
        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSES]", error);
        return apiError("Internal Error", 500);

    }

}