import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  category,
}: CourseCardProps) => {
  return (
    <Link href={`/courses/${id}`}>
      <div className="group overflow-hidden rounded-lg border-2 border-slate-200/80 bg-white shadow-sm transition hover:border-[#1e293b]/30 hover:shadow-md h-full flex flex-col">
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            alt={title}
            src={imageUrl}
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
        <div className="flex flex-col p-4">
          {category && (
            <p className="text-xs font-medium uppercase tracking-wide text-[#d4af37] mb-1">
              {category}
            </p>
          )}
          <h3 className="text-base font-bold text-[#1e293b] line-clamp-2 group-hover:text-[#0f172a] transition">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
};
