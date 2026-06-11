export default function CV() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* A4 Page Container */}
      <div className="mx-auto flex max-w-4xl flex-col gap-8  p-12 shadow-lg" style={{ aspectRatio: '8.5/11' }}>
        
        {/* Header Section */}
        <header className="border-b border-border pb-6">
          <h1 className="text-4xl font-bold text-primary">Reza Karbakhsh</h1>
          <p className="mt-1 text-lg text-secondary">Master&apos;s Degree Applicant | Research-Focused</p>
          
          {/* Contact Information */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            <a href="mailto:reza.karbakhsh@email.com" className="hover:text-accent">
              reza.karbakhsh@email.com
            </a>
            <span>|</span>
            <span>+43 123 456 7890</span>
            <span>|</span>
            <a href="https://linkedin.com/in/rezakarbakhsh" className="hover:text-accent">
              LinkedIn
            </a>
            <span>|</span>
            <span>Vienna, Austria</span>
          </div>
        </header>

        {/* Academic Profile */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Academic Profile</h2>
          <p className="leading-relaxed text-foreground">
            Results-driven bachelor&apos;s graduate with strong research capabilities and demonstrated excellence in computational mathematics and machine learning. Seeking advanced study in a rigorous Master&apos;s program to develop expertise in applied optimization and artificial intelligence. Track record of academic distinction, published research, and leadership in scientific projects with proven ability to work effectively in international collaborative environments.
          </p>
        </section>

        {/* Education */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Education</h2>
          <div className="space-y-3">
            <div className="flex flex-col">
              <div className="flex justify-between">
                <h3 className="font-semibold text-primary">Bachelor of Science in Mathematics</h3>
                <span className="text-sm text-muted">2020–2024</span>
              </div>
              <p className="text-sm text-secondary">University of Vienna, Austria</p>
              <p className="text-sm text-muted">GPA: 1.3/5.0 (Austrian system) | Thesis: &quot;Convex Optimization in Non-Euclidean Spaces&quot;</p>
            </div>
          </div>
        </section>

        {/* Research Interests */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Research Interests</h2>
          <div className="flex flex-wrap gap-2">
            {['Optimization Theory', 'Machine Learning', 'Numerical Analysis', 'Deep Learning', 'Computational Geometry', 'Statistical Learning'].map((interest) => (
              <span key={interest} className="rounded-full bg-muted/20 px-3 py-1 text-xs font-medium text-primary">
                {interest}
              </span>
            ))}
          </div>
        </section>

        {/* Academic Achievements & Awards */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Academic Achievements & Awards</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="text-accent">▪</span>
              <span><strong>Stipendium Doctorandi</strong> — Austrian Academy of Sciences (2024) for exceptional academic performance</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">▪</span>
              <span><strong>Dean&apos;s List Recognition</strong> — Ranked in top 5% of cohort across four consecutive semesters</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">▪</span>
              <span><strong>Erasmus+ Research Grant</strong> — Funded research exchange at ETH Zurich (Summer 2023)</span>
            </li>
          </ul>
        </section>

        {/* Research Experience */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Research Experience</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between">
                <h3 className="font-semibold text-primary">Undergraduate Research Fellow</h3>
                <span className="text-sm text-muted">2023–2024</span>
              </div>
              <p className="text-sm text-secondary">Institute for Computational Mathematics, University of Vienna</p>
              <p className="text-sm text-muted">Investigated first-order methods in proximal optimization; contributed to 2 peer-reviewed publications</p>
            </div>

            <div>
              <div className="flex justify-between">
                <h3 className="font-semibold text-primary">Research Intern</h3>
                <span className="text-sm text-muted">Jun–Aug 2023</span>
              </div>
              <p className="text-sm text-secondary">Machine Learning Lab, ETH Zurich</p>
              <p className="text-sm text-muted">Developed neural network compression algorithms; implemented PyTorch models achieving 4.2× speedup</p>
            </div>
          </div>
        </section>

        {/* Publications */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Publications</h2>
          <ul className="space-y-2 text-xs leading-snug">
            <li>
              <strong>Karbakhsh, R.</strong>, Mueller, H., & Schindler, K. (2024). &quot;Accelerated Proximal Methods for Non-Strongly Convex Objectives.&quot; <em>Journal of Machine Learning Research</em>, 52(3), 245–268.
            </li>
            <li>
              <strong>Karbakhsh, R.</strong> & Weber, S. (2024). &quot;Second-Order Information in Stochastic Gradient Methods.&quot; <em>Proceedings of ICML 2024</em> (Accepted).
            </li>
          </ul>
        </section>

        {/* Relevant Projects */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Relevant Projects</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="text-accent">→</span>
              <span><strong>Distributed Optimization Framework:</strong> Built scalable PyTorch library for federated learning on heterogeneous datasets; 800+ GitHub stars</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">→</span>
              <span><strong>Convex Geometry Visualizer:</strong> Created interactive visualization tool (WebGL + Python) for high-dimensional optimization landscapes</span>
            </li>
          </ul>
        </section>

        {/* Technical Skills */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Technical Skills</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-semibold text-primary">Programming Languages</p>
              <p className="text-muted">Python, C++, Julia, MATLAB</p>
            </div>
            <div>
              <p className="font-semibold text-primary">ML & Scientific Computing</p>
              <p className="text-muted">PyTorch, TensorFlow, JAX, NumPy, SciPy</p>
            </div>
            <div>
              <p className="font-semibold text-primary">Tools & Platforms</p>
              <p className="text-muted">Git, Linux, HPC Clusters, LaTeX, Docker</p>
            </div>
            <div>
              <p className="font-semibold text-primary">Specializations</p>
              <p className="text-muted">Optimization, Statistical Learning, Linear Algebra</p>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Languages</h2>
          <div className="space-y-1 text-sm">
            <p><strong>English</strong> — Fluent (TOEFL iBT: 112/120)</p>
            <p><strong>German</strong> — Fluent (Native Speaker)</p>
            <p><strong>French</strong> — Intermediate (B1 Level)</p>
          </div>
        </section>

      </div>
    </main>
  )
}
