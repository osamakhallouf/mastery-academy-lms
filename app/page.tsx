import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { PublicNavbar } from "@/components/public-navbar";
import Link from "next/link";
import { Briefcase, Cpu, Landmark, ShieldCheck } from "lucide-react";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { MobileSearchToggle } from "@/components/mobile-search-toggle";

interface HomePageProps {
  searchParams: {
    title?: string;
    categoryId?: string;
  };
}

const HomePage = async ({
  searchParams
}: HomePageProps) => {
  const { userId } = auth();
  
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    }
  });

  const courses = await getCourses({
    userId: userId || "",
    title: searchParams.title,
    categoryId: searchParams.categoryId,
  });

  const accreditationLogos = [
    { name: "ISO", color: "#1e40af" },
    { name: "CPD", color: "#16a34a" },
    { name: "KHDA", color: "#dc2626" },
    { name: "CIPD", color: "#7c3aed" },
    { name: "ILM", color: "#0f766e" },
  ];

  const clientLogos = [
    { name: "Global Energy", color: "#0f766e" },
    { name: "Aviation Group", color: "#1d4ed8" },
    { name: "Tech Consortium", color: "#7c3aed" },
    { name: "Telecom Leaders", color: "#dc2626" },
    { name: "Mega Projects", color: "#0f172a" },
  ];

  const trustLogos = [...accreditationLogos, ...clientLogos];

  const industryCategories = [
    {
      title: "Management",
      description: "Leadership, performance, and strategic execution.",
      icon: Briefcase,
    },
    {
      title: "Technical",
      description: "Digital transformation, data, and systems excellence.",
      icon: Cpu,
    },
    {
      title: "HSE",
      description: "Safety, compliance, and risk governance.",
      icon: ShieldCheck,
    },
    {
      title: "Finance",
      description: "Corporate finance, reporting, and controls.",
      icon: Landmark,
    },
  ];

  const buildLogoSrc = (label: string, color: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="56" viewBox="0 0 180 56">
        <rect width="180" height="56" rx="12" fill="${color}"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="white">${label}</text>
      </svg>`
    )}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-[80px] fixed inset-y-0 w-full z-50">
        <PublicNavbar />
      </div>
      <main className="pt-[80px]">
        {/* Hero */}
        <section className="bg-[#1e293b] text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-col gap-6 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-semibold">
                Enterprise Training Hub for Global Teams
              </h1>
              <p className="text-slate-200 text-base md:text-lg">
                Premium corporate learning experiences tailored for high-impact
                organizations, delivered by certified industry experts.
              </p>
              <div className="flex gap-3">
                <a
                  href="#latest-courses"
                  className="px-6 py-3 rounded-lg bg-[#d4af37] hover:bg-[#c89f2f] text-slate-900 font-semibold"
                >
                  Explore Programs
                </a>
                <a
                  href="#industry-categories"
                  className="px-6 py-3 rounded-lg border border-white/30 hover:border-white/60 text-white"
                >
                  Industry Focus
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Categories */}
        <section id="industry-categories" className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">
                  Industry Categories
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                  Specialized Learning Paths for Corporations
                </h2>
              </div>
              <p className="text-sm text-slate-600 max-w-xl">
                Curated curriculum designed to align with enterprise objectives and
                sector-specific requirements.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {industryCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1e293b] text-[#d4af37] mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust Slider */}
        <section className="bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Trusted by Global Accreditations and Enterprises
              </h2>
              <span className="text-sm text-slate-500">Trust Slider</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 py-6">
              <div className="logo-marquee gap-6 px-6">
                {[...trustLogos, ...trustLogos].map((logo, idx) => (
                  <img
                    key={`${logo.name}-${idx}`}
                    src={buildLogoSrc(logo.name, logo.color)}
                    alt={`${logo.name} logo`}
                    loading="lazy"
                    className="h-12 w-auto object-cover grayscale hover:grayscale-0 transition"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Latest Courses */}
        <section id="latest-courses" className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-slate-900">Latest Programs</h2>
          </div>
          <div className="mt-4 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  !searchParams.categoryId
                    ? "bg-[#1e293b] text-white border-[#1e293b]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#1e293b]"
                }`}
              >
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/?categoryId=${category.id}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    searchParams.categoryId === category.id
                      ? "bg-[#1e293b] text-white border-[#1e293b]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-[#1e293b]"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <CoursesList items={courses.slice(0, 8)} />
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white border-y border-slate-100">
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

        {/* Why Choose Us */}
        <section id="why-us" className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Why Enterprise Leaders Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Accredited Outcomes</h3>
                <p className="text-sm text-slate-600">
                  Globally recognized certifications that elevate workforce
                  credibility.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Expert Facilitators</h3>
                <p className="text-sm text-slate-600">
                  Senior practitioners with real-world enterprise experience.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Scalable Delivery</h3>
                <p className="text-sm text-slate-600">
                  Flexible formats tailored to global teams and schedules.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Head Office</h3>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 h-64 flex items-center justify-center text-sm text-slate-300">
              Corporate HQ Map Placeholder
            </div>
            <p className="mt-4 text-sm text-slate-300">
              WhatsApp: <span dir="ltr">+971557028756</span>
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Business Hours</h3>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6 text-sm text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span>Sunday - Thursday</span>
                <span dir="ltr">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Friday</span>
                <span dir="ltr">Closed</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Saturday</span>
                <span dir="ltr">10:00 AM - 2:00 PM</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Final address will be confirmed after official registration.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span>Mastery Academy Enterprise Training Hub</span>
            <span dir="ltr">Contact: +971557028756</span>
          </div>
        </div>
      </footer>

      <WhatsAppFloat message="Hello Mastery Academy, I'm interested in corporate training." />
    </div>
  );
}

export default HomePage;
