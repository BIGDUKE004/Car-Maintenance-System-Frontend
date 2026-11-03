#!/bin/bash
set -e

echo "Building Expertise Carousel..."

cat > src/pages/public/Landing.tsx << 'FILE'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ds/Button'
import { useState, useEffect, useRef } from 'react'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop'
]

const EXPERTISE_SERVICES = [
  { title: 'Engine Diagnostics', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop' },
  { title: 'Brake Systems', img: 'https://images.unsplash.com/photo-1599819095905-49e98b7cc606?q=80&w=2070&auto=format&fit=crop' },
  { title: 'Performance Tires', img: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?q=80&w=2072&auto=format&fit=crop' },
  { title: 'Oil & Fluid Changes', img: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6d7f9?q=80&w=2070&auto=format&fit=crop' },
  { title: 'Suspension Tuning', img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2070&auto=format&fit=crop' },
]

export default function Landing() {
  const [activeImage, setActiveImage] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = direction === 'left' ? -400 : 400
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 font-sans flex flex-col">
      <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="font-serif text-3xl font-bold tracking-tight text-white">
            Motora<span className="text-brand">.</span>
          </Link>
          <div className="hidden md:flex gap-10 text-sm font-medium text-stone-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#heritage" className="hover:text-white transition-colors">Heritage</a>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-white hover:text-brand transition-colors">Log In</Link>
            <Link to="/register"><Button className="rounded-xl px-8 py-3 uppercase tracking-wider text-xs font-bold">Book Service</Button></Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative h-screen flex items-center pt-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            {HERO_IMAGES.map((img, idx) => (
              <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === activeImage ? 'opacity-60' : 'opacity-0'}`} alt="Hero" />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <div className="max-w-2xl">
              <h1 className="text-6xl md:text-8xl font-serif text-white leading-[1.1] mb-8">
                The art of<br/>automotive care.
              </h1>
              <p className="text-xl text-stone-300 mb-10 leading-relaxed font-light">
                We treat every vehicle like a classic. From routine maintenance to complex diagnostics, experience a standard of service usually reserved for the track.
              </p>
              <div className="flex items-center gap-6">
                <Link to="/register"><Button className="h-14 px-10 text-lg rounded-xl font-semibold">Start Your Service</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERTISE CAROUSEL */}
        <section id="services" className="py-24 bg-stone-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Our Expertise</h2>
                <p className="text-stone-400">Comprehensive care for modern machines.</p>
              </div>
              {/* Desktop Arrows */}
              <div className="hidden md:flex gap-4">
                <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
            
            {/* Scrollable Container */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {EXPERTISE_SERVICES.map((s) => (
                <div key={s.title} className="min-w-[300px] md:min-w-[400px] snap-center group cursor-pointer">
                  <div className="overflow-hidden rounded-xl mb-6">
                    <img src={s.img} alt={s.title} className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-brand transition-colors">{s.title}</h3>
                  <p className="text-stone-500 text-sm">Certified technicians. OEM parts. Guaranteed work.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link to="/" className="font-serif text-3xl font-bold text-white block mb-6">Motora<span className="text-brand">.</span></Link>
            <p className="text-stone-400 max-w-sm mb-8">
              Redefining the standard of vehicle maintenance. Digital records, transparent pricing, and uncompromising quality.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-sm mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-stone-400">
              <li><a href="#" className="hover:text-brand">Routine Maintenance</a></li>
              <li><a href="#" className="hover:text-brand">Brake Systems</a></li>
              <li><a href="#" className="hover:text-brand">Engine Diagnostics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider text-sm mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-stone-400">
              <li><a href="#" className="hover:text-brand">About</a></li>
              <li><a href="#" className="hover:text-brand">Careers</a></li>
              <li><a href="#" className="hover:text-brand">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <div>© 2026 Motora Systems. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
FILE

# Add hide-scrollbar utility to index.css
cat >> src/index.css << 'FILE'

@layer utilities {
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
FILE

echo "Carousel applied."
