
// app/cv/page.tsx

import {
  Mail,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  Award,
  BookOpen,
  Languages,
  FlaskConical,
  Code2,
} from "lucide-react";

export default function AcademicCV() {
  return (
    <main className="bg-zinc-100 min-h-screen py-10">
      <div className="mx-auto w-[210mm] min-h-[297mm] bg-white shadow-2xl">

        {/* HEADER */}

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />

          <div className="absolute right-0 top-0 h-full w-64 bg-white/5 rotate-12 translate-x-20" />

          <div className="relative px-12 py-10 text-white">
            <div className="flex justify-between items-start">

              <div>
                <p className="uppercase tracking-[0.35em] text-slate-300 text-sm mb-2">
                  Master's Scholarship Applicant
                </p>

                <h1 className="text-5xl font-bold tracking-tight">
                  Reza Karbakhsh
                </h1>

                <p className="mt-4 text-slate-300 text-lg max-w-3xl">
                  Research-oriented Computer Science graduate with strong
                  academic standing, research experience in Artificial
                  Intelligence, and demonstrated potential for graduate-level
                  scholarship and research excellence.
                </p>
              </div>

              <div className="text-right space-y-2 text-sm">
                <div className="flex items-center gap-2 justify-end">
                  <Mail size={14} />
                  reza.karbakhsh@email.com
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Phone size={14} />
                  +98 912 345 6789
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <MapPin size={14} />
                  Tehran, Iran
                </div>

                <div className="flex items-center gap-2 justify-end">
                   <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  github.com/rezakarbakhsh
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Globe size={14} />
                  linkedin.com/in/rezakarbakhsh
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BODY */}

        <div className="grid grid-cols-12">

          {/* SIDEBAR */}

          <aside className="col-span-4 bg-slate-50 border-r border-slate-200 p-8">

            <SectionTitle
              icon={<FlaskConical size={18} />}
              title="Research Interests"
            />

            <div className="flex flex-wrap gap-2 mb-10">
              {[
                "Artificial Intelligence",
                "Machine Learning",
                "Computer Vision",
                "NLP",
                "Explainable AI",
                "Data Science",
                "Healthcare AI",
                "Deep Learning",
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-800"
                >
                  {item}
                </span>
              ))}
            </div>

            <SectionTitle
              icon={<Code2 size={18} />}
              title="Technical Skills"
            />

            <SkillGroup
              title="Programming"
              items="Python, C++, Java, SQL"
            />

            <SkillGroup
              title="Machine Learning"
              items="PyTorch, TensorFlow, Scikit-Learn"
            />

            <SkillGroup
              title="Research"
              items="LaTeX, Git, Linux, Overleaf"
            />

            <SkillGroup
              title="Data Science"
              items="Pandas, NumPy, XGBoost"
            />

            <SectionTitle
              icon={<Languages size={18} />}
              title="Languages"
            />

            <div className="space-y-3 text-sm mb-10">
              <Language name="Persian" level="Native" />
              <Language name="English" level="C1 Advanced" />
              <Language name="German" level="A2" />
              <Language name="French" level="A1" />
            </div>

            <SectionTitle
              icon={<Award size={18} />}
              title="Selected Awards"
            />

            <div className="space-y-4 text-sm">
              <AwardItem
                title="Dean's Honor List"
                year="2022–2024"
              />

              <AwardItem
                title="Research Excellence Award"
                year="2024"
              />

              <AwardItem
                title="Data Science Competition Winner"
                year="2024"
              />

              <AwardItem
                title="Merit Scholarship"
                year="2021–2025"
              />
            </div>
          </aside>

          {/* MAIN CONTENT */}

          <section className="col-span-8 p-8">

            <ContentSection title="Education">

              <div className="relative pl-6 border-l-2 border-slate-200">
                <div className="absolute w-4 h-4 rounded-full bg-slate-800 left-[-9px] top-2" />

                <h3 className="font-bold text-lg">
                  Bachelor of Science in Computer Engineering
                </h3>

                <p className="text-slate-600 font-medium">
                  University of Tehran
                </p>

                <p className="text-sm text-slate-500 mb-3">
                  Sep 2021 – Jun 2025
                </p>

                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• GPA: 3.89 / 4.00</li>
                  <li>• Ranked Top 5% among 180 students</li>
                  <li>
                    • Thesis: Deep Learning for Neurodegenerative Disease
                    Detection
                  </li>
                </ul>
              </div>

            </ContentSection>

            <ContentSection title="Research Experience">

              <Experience
                title="Undergraduate Research Assistant"
                org="AI & Intelligent Systems Laboratory"
                date="Jan 2024 – Present"
                bullets={[
                  "Designed explainable deep learning models for medical imaging.",
                  "Built CNN and Transformer pipelines using PyTorch.",
                  "Processed datasets exceeding 50,000 medical images.",
                  "Contributed to manuscript preparation and reproducible research workflows.",
                ]}
              />

              <Experience
                title="Research Intern"
                org="Data Science Research Group"
                date="Jun 2023 – Dec 2023"
                bullets={[
                  "Investigated predictive healthcare analytics.",
                  "Conducted benchmark studies and literature reviews.",
                  "Applied statistical evaluation methods for model comparison.",
                ]}
              />

            </ContentSection>

            <ContentSection title="Selected Academic Projects">

              <Project
                title="Explainable AI for Medical Image Classification"
                desc="Developed a deep-learning framework combining CNN architectures with Grad-CAM interpretability methods, achieving 93% accuracy."
              />

              <Project
                title="Multilingual Academic Recommendation System"
                desc="Built an NLP-based recommendation engine using transformer embeddings and semantic search technologies."
              />

              <Project
                title="Scholarship Candidate Evaluation Platform"
                desc="Created predictive analytics models and visual dashboards for academic performance assessment."
              />

            </ContentSection>

            <ContentSection title="Publications">

              <Publication
                text="Karbakhsh, R., Smith, J., Brown, A. (2025). Explainable Deep Learning Models for Medical Imaging Applications. Journal of Artificial Intelligence Research (Under Review)."
              />

              <Publication
                text="Karbakhsh, R. et al. (2024). Transformer-Based Approaches for Multilingual Academic Recommendation Systems. International Conference on Data Science & AI."
              />

            </ContentSection>
          </section>
        </div>
      </div>
    </main>
  );
}

/* Components */

function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      <div className="text-slate-700">{icon}</div>

      <h2 className="uppercase tracking-widest text-xs font-bold text-slate-700">
        {title}
      </h2>
    </div>
  );
}

function ContentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-[2px] bg-slate-800" />

        <h2 className="uppercase tracking-[0.2em] text-sm font-bold text-slate-800">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function SkillGroup({
  title,
  items,
}: {
  title: string;
  items: string;
}) {
  return (
    <div className="mb-4">
      <p className="font-semibold text-sm text-slate-800">
        {title}
      </p>

      <p className="text-sm text-slate-600">
        {items}
      </p>
    </div>
  );
}

function Language({
  name,
  level,
}: {
  name: string;
  level: string;
}) {
  return (
    <div className="flex justify-between">
      <span>{name}</span>
      <span className="text-slate-500">{level}</span>
    </div>
  );
}

function AwardItem({
  title,
  year,
}: {
  title: string;
  year: string;
}) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-slate-500">{year}</p>
    </div>
  );
}

function Experience({
  title,
  org,
  date,
  bullets,
}: any) {
  return (
    <div className="mb-6">
      <div className="flex justify-between">
        <h3 className="font-semibold">{title}</h3>

        <span className="text-sm text-slate-500">
          {date}
        </span>
      </div>

      <p className="text-slate-600 mb-2">
        {org}
      </p>

      <ul className="space-y-1 text-sm text-slate-700">
        {bullets.map((item: string) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Project({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="text-sm text-slate-700">
        {desc}
      </p>
    </div>
  );
}

function Publication({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mb-3 text-sm leading-relaxed text-slate-700">
      {text}
    </div>
  );
}
