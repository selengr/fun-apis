'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GradientBackground } from '@/components/views/GradientBackground'
import { DictionaryContent } from '@/components/views/DictionaryContent'
import CatFactModal from '@/components/views/CatFactModal'
import { AuthForm } from '@/components/auth/auth-form'
import { SignInForm } from '@/components/auth/sign-in-form'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { PasswordStrength } from '@/components/auth/password-strength'
import { SocialLogin } from '@/components/auth/social-login'
import { ThemeToggle } from '@/components/theme-toggle'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { NAV_GLASS, NAV_GLASS_CLASS } from '@/lib/nav-glass'
import { NAV_GLASS, NAV_GLASS_CLASS } from '@/lib/nav-glass'

function SamplePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      Loading {label}…
    </div>
  )
}

/** Animated / WebGL samples — client-only to avoid SSR hydration noise. */
const AgentInterface = dynamic(
  () => import('@/components/agent-interface').then(m => m.AgentInterface),
  { ssr: false, loading: () => <SamplePlaceholder label="AgentInterface" /> },
)
const GlitchBackground = dynamic(
  () => import('@/components/glitch-background').then(m => m.GlitchBackground),
  { ssr: false },
)
const TimeMachine = dynamic(() => import('@/components/time-machine'), {
  ssr: false,
  loading: () => <SamplePlaceholder label="TimeMachine" />,
})

function SampleBlock({
  id,
  title,
  path,
  note,
  children,
}: {
  id: string
  title: string
  path: string
  note?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 border border-border/60 bg-card/30 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Sample
          </p>
          <h2 className="mt-1 text-lg font-medium tracking-tight">{title}</h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground break-all">{path}</p>
          {note && <p className="mt-2 text-xs text-muted-foreground max-w-xl">{note}</p>}
        </div>
        <a
          href={`#${id}`}
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          #{id}
        </a>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  )
}

const TOC = [
  { id: 'agent', label: 'AgentInterface' },
  { id: 'glitch', label: 'GlitchBackground' },
  { id: 'gradient', label: 'GradientBackground' },
  { id: 'time', label: 'TimeMachine' },
  { id: 'dictionary', label: 'DictionaryContent' },
  { id: 'catfact', label: 'CatFactModal' },
  { id: 'auth-form', label: 'AuthForm' },
  { id: 'sign-in', label: 'SignInForm' },
  { id: 'sign-up', label: 'SignUpForm' },
  { id: 'password', label: 'PasswordStrength' },
  { id: 'social', label: 'SocialLogin' },
  { id: 'page-header', label: 'PageHeader' },
] as const

export function TestLab() {
  const [glitchHover, setGlitchHover] = useState(false)
  const [catOpen, setCatOpen] = useState(false)

  const [email, setEmail] = useState('sample@example.com')
  const [password, setPassword] = useState('SamplePass1!')
  const [rememberMe, setRememberMe] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  const noopSubmit = (e: FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setTimeout(() => setAuthLoading(false), 800)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-3xl flex items-center justify-between gap-3 px-5 py-3 rounded-2xl border border-border/60 ${NAV_GLASS_CLASS}`}
          style={NAV_GLASS}
        >
          <ThemeToggle />
          <span className="font-pixel text-[10px] tracking-[0.2em] text-muted-foreground hidden sm:inline">
            TEST LAB
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            Back home
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-20 space-y-8">
        <header className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Temporary · unused components
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[0.95]">
            Component samples
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground leading-relaxed">
            Orphaned UI mounted here as templates. Not linked from the main nav — open{' '}
            <code className="font-mono text-foreground">/test</code> directly.
          </p>

          <nav className="flex flex-wrap gap-2 pt-2">
            {TOC.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-2.5 py-1.5 border border-border/60 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <SampleBlock
          id="agent"
          title="AgentInterface"
          path="components/agent-interface.tsx"
          note="Old multi-agent IDE mock — previously homepage hero material."
        >
          <div className="min-h-[420px] overflow-hidden rounded-lg border border-border/40">
            <AgentInterface revealDelay={0} />
          </div>
        </SampleBlock>

        <SampleBlock
          id="glitch"
          title="GlitchBackground"
          path="components/glitch-background.tsx"
          note="Three.js shader background. Hover to pause the glitch wave."
        >
          <div
            className="relative h-64 sm:h-80 overflow-hidden border border-border/40"
            onMouseEnter={() => setGlitchHover(true)}
            onMouseLeave={() => setGlitchHover(false)}
          >
            <GlitchBackground isHovered={glitchHover} />
            <div className="absolute inset-0 flex items-end p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
                {glitchHover ? 'Paused' : 'Hover to pause'}
              </p>
            </div>
          </div>
        </SampleBlock>

        <SampleBlock
          id="gradient"
          title="GradientBackground"
          path="components/views/GradientBackground.tsx"
          note="Paper Design GrainGradient shader — absolute fill."
        >
          <div className="relative h-56 sm:h-72 overflow-hidden border border-border/40">
            <GradientBackground />
            <div className="relative z-10 flex h-full items-end p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
                Gradient sample
              </p>
            </div>
          </div>
        </SampleBlock>

        <SampleBlock
          id="time"
          title="TimeMachine"
          path="components/time-machine.tsx"
          note="Scroll / swipe through stacked frames. Commented out on the homepage."
        >
          <div className="h-[480px] sm:h-[560px] overflow-hidden border border-border/40">
            <TimeMachine />
          </div>
        </SampleBlock>

        <SampleBlock
          id="dictionary"
          title="DictionaryContent"
          path="components/views/DictionaryContent.tsx"
          note="Older dictionary UI (pulls DictionaryImage). Live dictionary uses ClassicDictionary."
        >
          <div className="max-w-2xl mx-auto">
            <DictionaryContent />
          </div>
        </SampleBlock>

        <SampleBlock
          id="catfact"
          title="CatFactModal"
          path="components/views/CatFactModal.tsx"
          note="Dialog that fetches catfact.ninja — open via the button."
        >
          <Button type="button" onClick={() => setCatOpen(true)}>
            Open CatFactModal
          </Button>
          <CatFactModal isOpen={catOpen} onClose={() => setCatOpen(false)} />
        </SampleBlock>

        <SampleBlock
          id="auth-form"
          title="AuthForm"
          path="components/auth/auth-form.tsx"
          note="Tabbed sign-in / sign-up (uses PasswordStrength + SocialLogin). Live auth uses AuthCard."
        >
          <div className="max-w-md mx-auto rounded-2xl border border-white/10 bg-[#1c1c1e] p-6">
            <AuthForm
              isLoading={authLoading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              onSignIn={noopSubmit}
              onSignUp={noopSubmit}
              onSocialLogin={() => undefined}
              onForgotPassword={() => undefined}
            />
          </div>
        </SampleBlock>

        <div className="grid gap-8 lg:grid-cols-2">
          <SampleBlock
            id="sign-in"
            title="SignInForm"
            path="components/auth/sign-in-form.tsx"
          >
            <div className="rounded-2xl border border-white/10 bg-[#1c1c1e] p-6">
              <SignInForm
                onSubmit={noopSubmit}
                isLoading={authLoading}
                email={email}
                setEmail={setEmail}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                onForgotPassword={() => undefined}
              />
            </div>
          </SampleBlock>

          <SampleBlock
            id="sign-up"
            title="SignUpForm"
            path="components/auth/sign-up-form.tsx"
          >
            <div className="rounded-2xl border border-white/10 bg-[#1c1c1e] p-6">
              <SignUpForm
                onSubmit={noopSubmit}
                isLoading={authLoading}
                password={password}
                setPassword={setPassword}
              />
            </div>
          </SampleBlock>
        </div>

        <SampleBlock
          id="password"
          title="PasswordStrength"
          path="components/auth/password-strength.tsx"
        >
          <div className="max-w-sm space-y-3">
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
              aria-label="Sample password"
            />
            <PasswordStrength password={password} />
          </div>
        </SampleBlock>

        <SampleBlock
          id="social"
          title="SocialLogin"
          path="components/auth/social-login.tsx"
        >
          <div className="max-w-sm rounded-2xl border border-white/10 bg-[#1c1c1e] p-6">
            <SocialLogin
              type="signin"
              isLoading={authLoading}
              onSocialLogin={() => undefined}
            />
          </div>
        </SampleBlock>

        <SampleBlock
          id="page-header"
          title="PageHeader"
          path="components/page-header.tsx"
          note="Shared page title block — still used on /notion; shown here as reference."
        >
          <PageHeader
            badge="Sample"
            title="Unused UI, still alive"
            subtitle="Mount orphaned components on /test so they stay as templates."
          />
        </SampleBlock>
      </div>
    </div>
  )
}
