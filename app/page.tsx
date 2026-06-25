'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  opacity: number
  fadeSpeed: number
}

interface MousePos {
  x: number
  y: number
}

export default function Home(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0, y: 0 })
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []

    // Generate stars with more visual variety
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        fadeSpeed: Math.random() * 0.008 + 0.001,
      })
    }

    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Enhanced gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#0B1020')
      gradient.addColorStop(0.5, '#1a1f35')
      gradient.addColorStop(1, '#0B1020')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw glow effect around mouse
      const mouseGradient = ctx.createRadialGradient(
        mousePos.x,
        mousePos.y,
        0,
        mousePos.x,
        mousePos.y,
        300
      )
      mouseGradient.addColorStop(0, 'rgba(108, 99, 255, 0.15)')
      mouseGradient.addColorStop(1, 'rgba(108, 99, 255, 0)')
      ctx.fillStyle = mouseGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.opacity -= particle.fadeSpeed

        if (particle.opacity <= 0) {
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
          particle.opacity = Math.random() * 0.6 + 0.2
        }

        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        ctx.fillStyle = `rgba(108, 99, 255, ${particle.opacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()

        // Add star glow
        const glowGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 3
        )
        glowGradient.addColorStop(0, `rgba(108, 99, 255, ${particle.opacity * 0.4})`)
        glowGradient.addColorStop(1, 'rgba(108, 99, 255, 0)')
        ctx.fillStyle = glowGradient
        ctx.fillRect(
          particle.x - particle.radius * 3,
          particle.y - particle.radius * 3,
          particle.radius * 6,
          particle.radius * 6
        )
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = (): void => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent): void => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [mousePos])

  return (
    <div className="relative w-full bg-background text-foreground overflow-hidden">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />

      {/* Animated gradient overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <div className="max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          {/* Logo/Title */}
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-md hover:border-primary/50 transition-colors duration-500">
              <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/40">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                Daily Universe
              </span>
              <Star className="w-4 h-4 text-secondary" />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Discover something
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
                amazing every day
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed max-w-2xl mx-auto font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              Your personalized portal to explore, learn, and discover. Experience curated content from across the universe delivered fresh each day.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
            <Link href="/dashboard" className="group">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 text-base h-12 rounded-full font-semibold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/50"
              >
                Start Exploring
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-secondary/50 text-secondary hover:bg-secondary/10 px-8 text-base h-12 rounded-full font-semibold transition-all duration-300 hover:border-secondary/80 hover:shadow-lg hover:shadow-secondary/30"
            >
              Get Inspired
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Feature hints with cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
            {[
              { icon: '🌍', title: 'Explore', desc: 'Discover worlds' },
              { icon: '🚀', title: 'Learn', desc: 'Expand knowledge' },
              { icon: '🎯', title: 'Engage', desc: 'Stay motivated' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-card/50 border border-card-foreground/10 backdrop-blur-sm hover:bg-card/80 hover:border-primary/50 transition-all duration-500 cursor-pointer"
              >
                <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-foreground/60">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-2 bg-primary/60 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
