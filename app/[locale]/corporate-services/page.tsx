import { PublicNavbar } from "@/components/public-navbar";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { CheckCircle2 } from "lucide-react";

const CorporateServicesPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-[80px] fixed inset-y-0 w-full z-50">
        <PublicNavbar />
      </div>
      <main className="pt-[80px]">
        <section className="bg-[#1e293b] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Corporate Services
            </p>
            <h1 className="mt-4 text-3xl md:text-5xl font-semibold">
              Enterprise-Grade Training Solutions
            </h1>
            <p className="mt-4 text-slate-200 max-w-2xl">
              Delivering strategic capability building through customized learning
              programs, executive facilitation, and measurable impact.
            </p>
            <a
              href="https://wa.me/971557028756"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#d4af37] px-6 py-3 font-semibold text-slate-900 hover:bg-[#c89f2f]"
            >
              Speak with an Enterprise Advisor
            </a>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12 space-y-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Customized Training
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Tailor-made programs aligned to your organizational strategy, role
              expectations, and industry compliance requirements.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-slate-600">
              {[
                "Role-based learning journeys and leadership tracks.",
                "On-site, blended, and virtual delivery formats.",
                "Executive coaching and high-impact workshops.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#1e293b]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Training Needs Analysis
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Comprehensive diagnostics to identify skill gaps, benchmark
              performance, and define measurable learning outcomes.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-slate-600">
              {[
                "Capability assessments and stakeholder interviews.",
                "Data-driven curriculum prioritization.",
                "KPI-aligned reporting and post-program evaluation.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#1e293b]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Contact the Enterprise Team</h3>
              <p className="text-sm text-slate-300">
                WhatsApp and direct line available for immediate response.
              </p>
            </div>
            <div className="text-lg font-semibold" dir="ltr">
              +971557028756
            </div>
          </div>
        </section>
      </main>
      <WhatsAppFloat message="Hello Mastery Academy, I need support with corporate services." />
    </div>
  );
};

export default CorporateServicesPage;
