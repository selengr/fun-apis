'use client'

import { Mail, MapPin, Globe, BookOpen, Award, Code2, Zap, Brain, ArrowRight } from 'lucide-react'

const LinkedinIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.474-2.237-1.667-2.237-1.005 0-1.602.678-1.865 1.332-.096.231-.12.554-.12.877v5.597h-3.554s.048-9.095 0-10.038h3.554v1.42c.44-.678 1.23-1.644 2.993-1.644 2.187 0 3.827 1.432 3.827 4.512l-.001 5.75zm-15.11-11.36c-1.144 0-1.885-.758-1.885-1.706 0-.968.747-1.706 1.915-1.706 1.168 0 1.885.738 1.905 1.706 0 .948-.737 1.706-1.935 1.706zm1.681 11.36h-3.596v-10.04h3.596v10.04zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export default function CVPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main CV Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-12">
        
        {/* Header Section - Premium Hero */}
        <section className="mb-16 pb-12 border-b border-card/40">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left: Name & Headline */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <div className="inline-block mb-4">
                  <span className="text-xs font-black tracking-widest text-accent uppercase px-3 py-1 bg-accent/10 border border-accent/30 rounded-full">
                    Master&apos;s Applicant
                  </span>
                </div>
                <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-2 text-primary leading-none">
                  REZA<br />KARBAKHSH
                </h1>
                <div className="h-1.5 w-40 bg-gradient-to-r from-accent to-accent/40 rounded-full mt-6 mb-8"></div>
              </div>

              <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl">
                <span className="text-primary font-semibold italic">Computer Science researcher</span> specializing in algorithmic optimization, distributed systems, and machine learning. Published work in approximation algorithms and scalable optimization techniques.
              </p>
            </div>

            {/* Right: Key Stats */}
            <div className="space-y-5">
              <div className="bg-card/40 border border-card/60 rounded-xl p-5 hover:border-accent/40 transition-all">
                <p className="text-xs font-black tracking-widest text-accent uppercase mb-2">Publications</p>
                <p className="text-4xl font-black text-primary">8</p>
                <p className="text-xs text-muted-foreground mt-1">Peer-reviewed papers</p>
              </div>
              <div className="bg-card/40 border border-card/60 rounded-xl p-5 hover:border-accent/40 transition-all">
                <p className="text-xs font-black tracking-widest text-accent uppercase mb-2">GPA</p>
                <p className="text-4xl font-black text-primary">3.92</p>
                <p className="text-xs text-muted-foreground mt-1">Top 2% of cohort</p>
              </div>
              <div className="bg-card/40 border border-card/60 rounded-xl p-5 hover:border-accent/40 transition-all">
                <p className="text-xs font-black tracking-widest text-accent uppercase mb-2">h-index</p>
                <p className="text-4xl font-black text-primary">12</p>
                <p className="text-xs text-muted-foreground mt-1">Research impact</p>
              </div>
            </div>
          </div>

          {/* Contact Links - Horizontal */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-10">
            <a href="mailto:reza@email.com" className="flex items-center gap-2 px-4 py-3 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 hover:bg-card/50 transition-all group">
              <Mail className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Email</span>
            </a>
            <a href="#" className="flex items-center gap-2 px-4 py-3 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 hover:bg-card/50 transition-all group">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Tehran, Iran</span>
            </a>
            <a href="#" className="flex items-center gap-2 px-4 py-3 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 hover:bg-card/50 transition-all group">
              <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">GitHub</span>
            </a>
            <a href="#" className="flex items-center gap-2 px-4 py-3 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 hover:bg-card/50 transition-all group">
              <LinkedinIcon className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">LinkedIn</span>
            </a>
            <a href="#" className="flex items-center gap-2 px-4 py-3 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 hover:bg-card/50 transition-all group">
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Website</span>
            </a>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-12">

            {/* Profile Statement */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-10 bg-gradient-to-b from-accent to-accent/40 rounded-full"></div>
                <h2 className="text-xs font-black tracking-widest text-primary uppercase">Academic Profile</h2>
              </div>
              <div className="bg-card/30 border border-card/60 rounded-xl p-6">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Computer Science student with demonstrated excellence in algorithmic research and machine learning. Strong publication record with focus on developing novel approximation algorithms for NP-hard problems. Seeking fully-funded Master&apos;s position at leading European and North American institutions to deepen expertise in optimization theory and its applications to large-scale distributed systems.
                </p>
              </div>
            </section>

            {/* Education */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-10 bg-gradient-to-b from-accent to-accent/40 rounded-full"></div>
                <h2 className="text-xs font-black tracking-widest text-primary uppercase">Education</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-card/30 border border-card/60 rounded-xl p-6 hover:border-accent/40 transition-all hover:bg-card/40">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-primary">B.Sc. Computer Science</h3>
                      <p className="text-sm text-accent font-semibold mt-1">Sharif University of Technology</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">2020–2024</span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="text-primary font-semibold">GPA: 3.92/4.0</span> | Rank: Top 2% of cohort</p>
                    <p className="italic">Thesis: &quot;Approximation Algorithms for Dynamic Graph Optimization Problems&quot;</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Research Focus */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-10 bg-gradient-to-b from-accent to-accent/40 rounded-full"></div>
                <h2 className="text-xs font-black tracking-widest text-primary uppercase">Research Focus</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Approximation Algorithms',
                  'Optimization Theory',
                  'Graph Algorithms',
                  'Machine Learning',
                  'Distributed Computing',
                  'Algorithmic Game Theory'
                ].map((interest) => (
                  <div key={interest} className="px-4 py-3 bg-secondary/15 border border-secondary/40 rounded-lg text-xs font-bold text-primary hover:bg-secondary/25 hover:border-secondary/60 transition-all cursor-pointer">
                    {interest}
                  </div>
                ))}
              </div>
            </section>

            {/* Research Experience */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-10 bg-gradient-to-b from-accent to-accent/40 rounded-full"></div>
                <h2 className="text-xs font-black tracking-widest text-primary uppercase">Research Experience</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-card/30 border border-card/60 rounded-xl p-6 hover:border-accent/40 transition-all hover:bg-card/40">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-primary">Research Fellow, Algorithm Lab</h3>
                      <p className="text-sm text-accent font-semibold">Sharif University of Technology</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">2022–Present</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-3">
                      <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>Developed novel 2-approximation algorithm for weighted vertex cover on dynamic graphs (SODA 2024)</span>
                    </li>
                    <li className="flex gap-3">
                      <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>Mentored 3 undergraduate projects; 2 resulted in co-authored publications</span>
                    </li>
                    <li className="flex gap-3">
                      <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>Implemented parallel C++ algorithms achieving 150× speedup on 256-core clusters</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-card/30 border border-card/60 rounded-xl p-6 hover:border-accent/40 transition-all hover:bg-card/40">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-primary">ML Research Intern</h3>
                      <p className="text-sm text-accent font-semibold">Iran Telecoms Research Center</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">2021–2022</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-3">
                      <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>ML pipeline for network optimization achieving 23% latency reduction</span>
                    </li>
                    <li className="flex gap-3">
                      <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>Processed 5TB+ telecommunications dataset using distributed frameworks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Publications */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-10 bg-gradient-to-b from-accent to-accent/40 rounded-full"></div>
                <h2 className="text-xs font-black tracking-widest text-primary uppercase">Publications</h2>
              </div>
              <div className="space-y-3">
                {[
                  {
                    title: "Approximation Algorithms for Dynamic Weighted Vertex Cover",
                    venue: "SODA 2024",
                    status: "Peer-Reviewed • Citations: 12"
                  },
                  {
                    title: "Machine Learning for Network Optimization at Scale",
                    venue: "NeurIPS 2023 Workshop",
                    status: "Peer-Reviewed • Citations: 8"
                  },
                  {
                    title: "Distributed Approximation Algorithms for Graph Problems",
                    venue: "ACM SODA 2023",
                    status: "Peer-Reviewed • Citations: 15"
                  }
                ].map((pub, idx) => (
                  <div key={idx} className="border-l-2 border-secondary/40 pl-5 hover:border-accent/60 transition-colors py-3">
                    <p className="text-sm font-semibold text-primary mb-1">{pub.title}</p>
                    <p className="text-xs text-accent font-medium">{pub.venue}</p>
                    <p className="text-xs text-muted-foreground mt-1">{pub.status}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Awards */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black tracking-widest text-primary uppercase">Awards & Honors</h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'National Olympiad Finalist', desc: 'Iran Physics Olympiad • 2019' },
                  { title: "Dean's Excellence Award", desc: 'Sharif University • 2023' },
                  { title: 'Research Grant Winner', desc: 'Iran NSF • $15K • 2023' },
                  { title: 'Best Poster Award', desc: 'ACM ICCAD 2023' }
                ].map((award, idx) => (
                  <div key={idx} className="p-4 bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/15 hover:border-accent/50 transition-all">
                    <p className="text-xs font-bold text-primary">{award.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{award.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black tracking-widest text-primary uppercase">Technical Skills</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-primary mb-2">Languages</p>
                  <div className="space-y-2">
                    {[
                      { name: 'C++', level: 95 },
                      { name: 'Python', level: 90 },
                      { name: 'Java', level: 85 }
                    ].map((lang) => (
                      <div key={lang.name}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">{lang.name}</span>
                          <span className="text-xs text-accent font-bold">{lang.level}%</span>
                        </div>
                        <div className="h-2 bg-card/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full"
                            style={{ width: `${lang.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-primary mb-2">Tools &amp; Frameworks</p>
                  <div className="flex flex-wrap gap-2">
                    {['TensorFlow', 'PyTorch', 'MPI', 'CUDA', 'Git', 'Linux', 'LaTeX', 'Docker'].map((tool) => (
                      <span key={tool} className="px-2.5 py-1 text-xs bg-secondary/20 border border-secondary/40 rounded-md text-primary hover:bg-secondary/30 hover:border-secondary/60 transition-all">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Projects */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black tracking-widest text-primary uppercase">Projects</h3>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 hover:bg-card/40 transition-all group cursor-pointer">
                  <p className="text-xs font-bold text-primary group-hover:text-accent transition-colors">GraphOptim Suite</p>
                  <p className="text-xs text-muted-foreground mt-2">Open-source C++ library. 450+ stars</p>
                </div>
                <div className="p-4 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 hover:bg-card/40 transition-all group cursor-pointer">
                  <p className="text-xs font-bold text-primary group-hover:text-accent transition-colors">AlgoVisualizer</p>
                  <p className="text-xs text-muted-foreground mt-2">Interactive visualization. 2K+ users</p>
                </div>
              </div>
            </section>

            {/* Languages */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black tracking-widest text-primary uppercase">Languages</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 transition-all">
                  <span className="text-xs font-semibold text-primary">Persian</span>
                  <span className="text-xs text-accent font-bold">Native</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 transition-all">
                  <span className="text-xs font-semibold text-primary">English</span>
                  <span className="text-xs text-accent font-bold">Fluent (TOEFL: 109)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card/30 border border-card/60 rounded-lg hover:border-accent/40 transition-all">
                  <span className="text-xs font-semibold text-primary">German</span>
                  <span className="text-xs text-accent font-bold">Intermediate (B2)</span>
                </div>
              </div>
            </section>

            {/* Social Links */}
            <div className="pt-6 border-t border-card/40">
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-3 text-xs text-muted-foreground hover:text-primary transition-colors group">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  <span className="group-hover:underline">github.com/rezakarbakhsh</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-xs text-muted-foreground hover:text-primary transition-colors group">
                  <LinkedinIcon className="w-4 h-4 text-accent" />
                  <span className="group-hover:underline">linkedin.com/in/rezakarbakhsh</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-xs text-muted-foreground hover:text-primary transition-colors group">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span className="group-hover:underline">Google Scholar</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
