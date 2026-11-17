export function Halo({ className = '' }: { className?: string }) {
  const dots = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2 - Math.PI / 2
    return {
      cx: 100 + Math.cos(angle) * 78,
      cy: 100 + Math.sin(angle) * 78,
    }
  })

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="0.35" />
      {dots.map((dot) => (
        <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r="1.3" fill="currentColor" />
      ))}
    </svg>
  )
}
