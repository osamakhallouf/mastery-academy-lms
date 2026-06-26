import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { getCourses } from "@/actions/get-courses";
import { getCourseCities } from "@/actions/get-course-cities";
import { getCourseMonths, monthLabel } from "@/actions/get-course-months";
import { PublicNavbar } from "@/components/public-navbar";
import { HomeFilterBar } from "@/components/home-filter-bar";
import { UpcomingTrainingTable } from "@/components/upcoming-training-table";
import { CourseCard } from "@/components/course-card";
import Image from "next/image";
import { Briefcase, Cpu, Landmark, ShieldCheck } from "lucide-react";
import { WhatsAppFloat } from "@/components/whatsapp-float";

interface HomePageProps {
  searchParams: {
    title?: string;
    categoryId?: string;
    city?: string;
    month?: string;
    page?: string;
    limit?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("footer");
  const { userId } = auth();

  const [categories, cities, monthsRaw, { courses }] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    getCourseCities(),
    getCourseMonths(),
    getCourses({
      userId: userId ?? "",
      title: searchParams.title,
      categoryId: searchParams.categoryId,
      city: searchParams.city,
      month: searchParams.month,
      page: searchParams.page ? Number(searchParams.page) : undefined,
      limit: searchParams.limit ? Number(searchParams.limit) : undefined,
    }),
  ]);

  const monthOptions = monthsRaw.map((value) => ({ value, label: monthLabel(value) }));

  const accreditationLogos = [
    { name: "ISO 9001:2015", color: "#1e40af" },
    { name: "CPD", color: "#16a34a" },
    { name: "KHDA", color: "#0f172a" },
    { name: "CIPD", color: "#7c3aed" },
    { name: "ILM", color: "#0f766e" },
  ];

  const industryCategories = [
    { title: "Management", descriptionKey: "Leadership, performance, and strategic execution.", icon: Briefcase },
    { title: "Technical", descriptionKey: "Digital transformation, data, and systems excellence.", icon: Cpu },
    { title: "HSE", descriptionKey: "Safety, compliance, and risk governance.", icon: ShieldCheck },
    { title: "Finance", descriptionKey: "Corporate finance, reporting, and controls.", icon: Landmark },
  ];

  const buildLogoSrc = (label: string, color: string, size = 180) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 0.45)}" viewBox="0 0 ${size} ${Math.round(size * 0.45)}">
        <rect width="100%" height="100%" rx="12" fill="${color}"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(size / 10)}" fill="white" font-weight="600">${label}</text>
      </svg>`
    )}`;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="h-[80px] fixed inset-y-0 w-full z-50">
        <PublicNavbar />
      </div>
      <main className="pt-[80px]">
        <section className="bg-[#1e293b] text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-col gap-6 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-semibold">{t("heroTitle")}</h1>
              <p className="text-slate-200 text-base md:text-lg">{t("heroSubtitle")}</p>
              <div className="flex gap-3">
                <a href="#upcoming-courses" className="px-6 py-3 rounded-lg bg-[#d4af37] hover:bg-[#c89f2f] text-[#1e293b] font-semibold">
                  {t("viewTrainingCalendar")}
                </a>
                <a href="#industry-categories" className="px-6 py-3 rounded-lg border border-[#d4af37]/50 hover:bg-[#d4af37]/10 text-white">
                  {t("industryFocus")}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="upcoming-courses" className="bg-slate-100 py-10">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2">{t("upcomingTrainingCourses")}</h2>
            <p className="text-slate-600 mb-6">{t("upcomingSubtitle")}</p>
            <div className="mb-6">
              <HomeFilterBar categories={categories} cities={cities} months={monthOptions} />
            </div>
            <UpcomingTrainingTable items={courses} />
          </div>
        </section>

        {courses.length > 0 && (
          <section className="bg-white py-10 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl font-bold text-[#1e293b] mb-6">{t("programs")}</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {courses.slice(0, 8).map((item) => (
                  <CourseCard key={item.id} id={item.id} title={item.title} imageUrl={item.imageUrl ?? ""} category={item?.category?.name ?? ""} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <a href="#upcoming-courses" className="inline-flex items-center justify-center rounded-lg bg-[#1e293b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0f172a]">
                  {tCommon("viewAllCourses")}
                </a>
              </div>
            </div>
          </section>
        )}

        <section id="industry-categories" className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">{t("industryCategories")}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]">{t("industryCategoriesSubtitle")}</h2>
              </div>
              <p className="text-sm text-slate-600 max-w-xl">
                Curated curriculum designed to align with enterprise objectives and sector-specific requirements.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {industryCategories.map(({ title, descriptionKey, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1e293b] text-[#d4af37] mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1e293b] mb-2">{title}</h3>
                  <p className="text-sm text-slate-600">{descriptionKey}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
                <p className="text-3xl font-semibold text-[#1e293b]">+500</p>
                <p className="text-sm text-slate-600 mt-1">Enterprise Programs</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
                <p className="text-3xl font-semibold text-[#1e293b]">+2000</p>
                <p className="text-sm text-slate-600 mt-1">Corporate Learners</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
                <p className="text-3xl font-semibold text-[#1e293b]">+50</p>
                <p className="text-sm text-slate-600 mt-1">Certified Trainers</p>
              </div>
            </div>
          </div>
        </section>

        <section id="accreditations" className="bg-white py-14 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2 text-center">{t("accreditations")}</h2>
            <p className="text-slate-600 text-center mb-10 max-w-xl mx-auto">{t("accreditationsSubtitle")}</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {accreditationLogos.map((logo) => (
                <div key={logo.name} className="flex items-center justify-center rounded-xl border-2 border-slate-100 bg-slate-50/80 p-6 md:p-8 shadow-sm hover:shadow-md transition min-w-[200px] md:min-w-[240px]">
                  <Image src={buildLogoSrc(logo.name, logo.color, 220)} alt={`${logo.name} certified`} width={220} height={99} unoptimized className="h-16 md:h-20 w-auto object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why-us" className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-bold text-[#1e293b] mb-6">{t("whyChooseUs")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border-2 border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Accredited Outcomes</h3>
                <p className="text-sm text-slate-600">Globally recognized certifications that elevate workforce credibility.</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Expert Facilitators</h3>
                <p className="text-sm text-slate-600">Senior practitioners with real-world enterprise experience.</p>
              </div>
              <div className="rounded-xl border-2 border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Scalable Delivery</h3>
                <p className="text-sm text-slate-600">Flexible formats tailored to global teams and schedules.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1e293b] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-[#d4af37]">{tFooter("headOffice")}</h3>
            <div className="rounded-xl border border-white/10 bg-white/5 h-64 flex items-center justify-center text-sm text-slate-300">Corporate HQ Map Placeholder</div>
            <p className="mt-4 text-sm text-slate-300">WhatsApp: <span dir="ltr">+971557028756</span></p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-[#d4af37]">{tFooter("businessHours")}</h3>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 space-y-2">
              <div className="flex items-center justify-between"><span>Sunday - Thursday</span><span dir="ltr">9:00 AM - 6:00 PM</span></div>
              <div className="flex items-center justify-between"><span>Friday</span><span dir="ltr">Closed</span></div>
              <div className="flex items-center justify-between"><span>Saturday</span><span dir="ltr">10:00 AM - 2:00 PM</span></div>
            </div>
            <p className="mt-4 text-xs text-slate-400">Final address will be confirmed after official registration.</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span>{tFooter("copyright")}</span>
            <span dir="ltr">Contact: +971557028756</span>
          </div>
        </div>
      </footer>

      <WhatsAppFloat message="Hello Mastery Academy, I'm interested in corporate training." />
    </div>
  );
}
