'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

interface SycharBootProps {
  onComplete: () => void
}

export default function SycharBoot({ onComplete }: SycharBootProps) {
  const [mounted, setMounted] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }

    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onComplete, 400)
    }, 2800)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!mounted) return null

  // Approximate path for "Sychar" in DM Serif Display style
  // Using a simplified path for demonstration; in production, use a precise trace
  const sycharPath = "M20,70 L40,30 L60,70 M50,55 L30,55 M80,30 L80,70 M110,30 C100,30 90,40 90,50 C90,60 100,70 110,70 M140,30 L140,70 M140,50 L160,50 M160,30 L160,70 M190,70 L210,30 L230,70 M220,55 L200,55 M250,30 L250,70 M250,30 C260,30 270,35 270,45 C270,55 260,60 250,60 L270,70"

  return createPortal(
    <div 
      className={`fixed inset-0 bg-[#0D0F12] z-[9999] flex flex-col items-center justify-center transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center">
        <svg width="400" height="120" viewBox="0 0 400 120" className="mb-4 overflow-visible">
          <style>
            {`
              @keyframes sychar-draw {
                from { stroke-dashoffset: ${pathLength}; fill: transparent; }
                to { stroke-dashoffset: 0; fill: #2DD4BF; }
              }
              .sychar-path {
                stroke: #2DD4BF;
                stroke-width: 1.5;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: ${pathLength};
                stroke-dashoffset: ${pathLength};
                animation: sychar-draw 2s ease-in-out forwards;
              }
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .fade-in-delayed-1 {
                opacity: 0;
                animation: fade-in 0.6s ease-out 1.8s forwards;
              }
              .fade-in-delayed-2 {
                opacity: 0;
                animation: fade-in 0.6s ease-out 2.2s forwards;
              }
            `}
          </style>
          
          {/* Using text for better font fidelity since path tracing is complex manually */}
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="font-display text-[80px] fill-transparent stroke-[#2DD4BF] stroke-[1.5]"
            style={{
              strokeDasharray: pathLength || 1000,
              strokeDashoffset: pathLength || 1000,
              animation: 'sychar-draw 2s ease-in-out forwards'
            }}
            ref={(el) => {
              if (el && !pathLength) {
                // Approximate length for SVG text
                setPathLength(1000)
              }
            }}
          >
            Sychar
          </text>
        </svg>

        <div className="text-center">
          <div className="fade-in-delayed-1 text-[#64748B] text-[13px] font-medium tracking-[0.2em] font-body uppercase mb-2">
            CoPilot
          </div>
          <div className="fade-in-delayed-2 text-[#334155] text-[11px] font-body">
            Nkoroi Mixed Secondary Day School
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
