// app/cv/page.tsx

import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ChevronRight,
} from "lucide-react";

export default function AcademicCV() {
  return (
    <main className="bg-neutral-100 min-h-screen w-fit p-10">
      <div className="mx-auto w-[210mm] min-h-[297mm] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.12)] overflow-hidden">

        {/* TOP STRIP */}

        <div className="h-3 bg-gradient-to-r from-indigo-900 via-slate-800 to-indigo-900" />

        {/* HERO */}

        <section className="grid grid-cols-12">

          {/* LEFT */}

          <div className="col-span-7 p-14">

            <p className="uppercase tracking-[0.5em] text-xs text-slate-500 mb-8">
              Academic Curriculum Vitae
            </p>

            <h1 className="text-7xl leading-none font-black tracking-tight text-slate-900">
              Reza
            </h1>

            <h1 className="text-7xl leading-none font-black tracking-tight text-slate-900 mb-8">
              Karbakhsh
            </h1>

            <div className="w-20 h-1 bg-indigo-900 mb-8" />

            <p className="text-lg leading-relaxed text-slate-600 max-w-2xl">
              Research-oriented Computer Science graduate focused on
              Artificial Intelligence, Machine Learning, and Data Science.
              Seeking fully funded Master's opportunities to contribute
              to impactful interdisciplinary research.
            </p>
          </div>

          {/* RIGHT */}

          <div className="col-span-5 bg-slate-950 text-white p-14 flex flex-col justify-between">

            <div>
              <div className="text-slate-400 text-xs uppercase tracking-[0.3em] mb-6">
                Contact
              </div>

              <div className="space-y-5 text-sm">

                <Contact icon={<Mail size={14} />}>
                  reza.karbakhsh@email.com
                </Contact>

                <Contact icon={<Phone size={14} />}>
                  +98 912 345 6789
                </Contact>

                <Contact icon={<MapPin size={14} />}>
                  Tehran, Iran
                </Contact>

                <Contact icon={<Globe size={14} />}>
                  linkedin.com/in/rezakarbakhsh
                </Contact>
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-xs uppercase tracking-[0.3em] mb-3">
                Research Areas
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "AI",
                  "Machine Learning",
                  "Computer Vision",
                  "NLP",
                  "Healthcare AI",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 border border-slate-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}

        <section className="grid grid-cols-12">

          {/* TIMELINE */}

          <div className="col-span-4 border-r border-slate-200 p-10">

            <SectionTitle>Academic Journey</SectionTitle>

            <div className="relative mt-10">

              <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />

              <TimelineItem
                year="2025"
                title="Bachelor Graduation"
                desc="Computer Engineering"
              />

              <TimelineItem
                year="2024"
                title="Research Assistant"
                desc="AI Laboratory"
              />

              <TimelineItem
                year="2024"
                title="Research Award"
                desc="National Excellence"
              />

              <TimelineItem
                year="2023"
                title="Research Internship"
                desc="Data Science Group"
              />

              <TimelineItem
                year="2021"
                title="University Admission"
                desc="Top Academic Track"
              />
            </div>

            <SectionTitle className="mt-16">
              Languages
            </SectionTitle>

            <div className="space-y-4 mt-6">
              <SkillBar
                label="English"
                value="90%"
              />

              <SkillBar
                label="Persian"
                value="100%"
              />

              <SkillBar
                label="German"
                value="40%"
              />
            </div>
          </div>

          {/* MAIN */}

          <div className="col-span-8 p-10">

            <AcademicBlock
              number="01"
              title="Education"
            >
              <div className="border border-slate-200 rounded-2xl p-6">

                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-lg">
                    B.Sc. Computer Engineering
                  </h3>

                  <span className="text-slate-500">
                    2021–2025
                  </span>
                </div>

                <p className="text-slate-700 font-medium">
                  University of Tehran
                </p>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <Metric
                    value="3.89"
                    label="GPA"
                  />

                  <Metric
                    value="Top 5%"
                    label="Rank"
                  />

                  <Metric
                    value="180"
                    label="Students"
                  />
                </div>
              </div>
            </AcademicBlock>

            <AcademicBlock
              number="02"
              title="Research Experience"
            >
              <ResearchCard
                title="AI & Intelligent Systems Laboratory"
                date="2024–Present"
                items={[
                  "Explainable Deep Learning",
                  "Medical Imaging",
                  "Transformer Architectures",
                  "Research Publication Support",
                ]}
              />

              <ResearchCard
                title="Data Science Research Group"
                date="2023–2024"
                items={[
                  "Predictive Analytics",
                  "Healthcare Datasets",
                  "Benchmark Studies",
                ]}
              />
            </AcademicBlock>

            <AcademicBlock
              number="03"
              title="Selected Projects"
            >
              <ProjectCard
                title="Explainable AI for Medical Imaging"
                desc="Developed interpretable CNN systems achieving 93% accuracy."
              />

              <ProjectCard
                title="Academic Recommendation Engine"
                desc="Transformer-based recommendation platform for research papers."
              />

              <ProjectCard
                title="Scholarship Evaluation Analytics"
                desc="Predictive platform for educational performance assessment."
              />
            </AcademicBlock>

            <AcademicBlock
              number="04"
              title="Publications"
            >
              <PublicationCard>
                Explainable Deep Learning Models for Medical Imaging
                Applications — Under Review (2025)
              </PublicationCard>

              <PublicationCard>
                Transformer-Based Multilingual Academic Recommendation
                Systems — Conference Paper (2024)
              </PublicationCard>
            </AcademicBlock>
          </div>
        </section>
      </div>
    </main>
  );
}

function Contact({
  icon,
  children,
}: any) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function SectionTitle({
  children,
  className = "",
}: any) {
  return (
    <h2
      className={`uppercase tracking-[0.3em] text-xs font-bold text-slate-500 ${className}`}
    >
      {children}
    </h2>
  );
}

function TimelineItem({
  year,
  title,
  desc,
}: any) {
  return (
    <div className="relative pl-10 pb-8">
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-900" />

      <p className="font-bold text-slate-900">
        {year}
      </p>

      <p className="font-medium">
        {title}
      </p>

      <p className="text-sm text-slate-500">
        {desc}
      </p>
    </div>
  );
}

function AcademicBlock({
  number,
  title,
  children,
}: any) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl font-black text-slate-200">
          {number}
        </span>

        <h2 className="text-2xl font-bold text-slate-900">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function Metric({
  value,
  label,
}: any) {
  return (
    <div>
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </div>
  );
}

function ResearchCard({
  title,
  date,
  items,
}: any) {
  return (
    <div className="border-l-4 border-indigo-900 pl-5 mb-6">
      <div className="flex justify-between">
        <h3 className="font-bold">
          {title}
        </h3>

        <span className="text-slate-500 text-sm">
          {date}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((item: string) => (
          <div
            key={item}
            className="flex items-center gap-2 text-sm"
          >
            <ChevronRight size={14} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  title,
  desc,
}: any) {
  return (
    <div className="mb-5 p-5 rounded-xl bg-slate-50 border border-slate-200">
      <h3 className="font-semibold mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-600">
        {desc}
      </p>
    </div>
  );
}

function PublicationCard({
  children,
}: any) {
  return (
    <div className="border-b border-slate-200 py-4 text-sm leading-relaxed">
      {children}
    </div>
  );
}

function SkillBar({
  label,
  value,
}: any) {
  return (
    <div>
      <div className="flex justify-between mb-2 text-sm">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="h-2 bg-slate-200 rounded-full">
        <div
          className="h-2 bg-indigo-900 rounded-full"
          style={{ width: value }}
        />
      </div>
    </div>
  );
}
