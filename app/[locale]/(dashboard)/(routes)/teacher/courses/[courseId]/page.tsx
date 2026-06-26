import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { CircleDollarSign, File, LayoutDashboard, Calendar } from "lucide-react";


import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { PriceFrom } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { Actions } from "./_components/actions";
import { CourseRunsForm } from "./_components/course-runs-form";



const CouseIdPage = async ({
    params
}:{
    params:{courseId:string}
}) => {
    const locale = await getLocale();
    const {userId}= auth();
    if(!userId){
        return redirect({ href: "/", locale });
    }
    const course =await db.course.findUnique({
       where:{
          id: params.courseId,
          userId
        },
        include: {
            attachments: {
                orderBy: {
                    createAt: "desc",
                },
            },
            courseRuns: {
                orderBy: {
                    startDate: "asc",
                },
            },
        },
    });

    const Categories = await db.category.findMany({
        orderBy:{
            name:"asc"
        },
    });
  

    if (!course) {
        return redirect({ href: "/", locale });
    }
     const requiredFields =[
        course.title,
        course.description,
        course.imageUrl,
        course.categoryId,
      ];
     const totalFileds = requiredFields.length;
     const compeltedFildes =requiredFields.filter(Boolean).length;

     const compeletionText = `(${compeltedFildes}/${totalFileds})`

     const isComplete = requiredFields.every(Boolean);

    return ( 
      <>
      {!course.isPublished && (
        <Banner
         label="This course is unpublished. It will not be visible to the students."
        
        />
      )}
        <div className="p-6">
           <div className="flex items-center justify-between" >
            <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">
                    cousre setup
                </h1>
                <span className="text-sm text-slate-700">
                    complete all fields {compeletionText}
                </span>
            </div>
            <Actions
             disabled={!isComplete}
             courseId={params.courseId}
             isPublished={course.isPublished}
            />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <div>
            <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard}/>    
            <h2 className="text-xl">
            Customize your course
            </h2>
            </div>
            <TitleForm
              initalData={course}
              courseId={course.id}
            />
            <DescriptionForm
              initalData={course}
              courseId={course.id}
            />
            <ImageForm
              initialData={course}
              courseId={course.id}
            />  
              <CategoryForm
              initialData={course}
              courseId={course.id}
              options={Categories.map((category) => ({
                label : category.name,
                value: category.id,
              }))} 
            />                         
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-x-2">
                    <IconBadge icon = {CircleDollarSign} />
                <h2 className="text-xl">
                    Course price (optional)
                </h2>
                </div>
                <PriceFrom
                  initalData={course}
                  courseId={course.id}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                    <IconBadge icon={Calendar} />
                <h2 className="text-xl">
                    Course Schedule
                </h2>
                </div>
                <CourseRunsForm
                  courseId={course.id}
                  initialRuns={course.courseRuns}
                />
              </div>
              <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon = {File} />
                <h2 className="text-xl">
                    Resources & Attachments
                </h2>
                </div>  
                <AttachmentForm
              initalData={course}
              courseId={course.id}
                />                                
              </div>
            </div>
           </div>
        </div>
        </>
     );
}
 
export default CouseIdPage;

