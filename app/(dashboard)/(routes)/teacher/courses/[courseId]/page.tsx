import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CircleDollarSign, File, LayoutDashboard, ListChecks } from "lucide-react";


import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { AuthorForm } from "./_components/author-form";
import { CategoryForm } from "./_components/category-form";
import { PriceFrom } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Actions } from "./_components/actions";



const CouseIdPage = async ({
    params
}:{
    params:{courseId:string}
}) => {
    const {userId}= auth();
    if(!userId){
        return redirect("/");
    }
    const course =await db.course.findUnique({
       where:{
          id: params.courseId,
          userId
        },
        include: {
            chapters:{
                orderBy:{
                    position: "asc"
                  },
                },
            attachments: {
                orderBy: {
                    createAt: "desc",
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
        return redirect("/");
    }
     const requiredFields =[
        course.title,
        course.description,
        course.imageUrl,
        course.price,
        course.categoryId,
        course.chapters.some(chapter => chapter.isPublished),
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
            <AuthorForm
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
                    <IconBadge icon = {ListChecks} />
                    <h2 className="text-xl">
                        Course chapters
                    </h2>
                </div>
             <ChaptersForm
              initialData={course}
              courseId={course.id}
             />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                <IconBadge icon = {CircleDollarSign} />
                <h2 className="text-xl">
                    Sell your course
                </h2>
                </div>
                <PriceFrom
                  initalData={course}
                  courseId={course.id}
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

