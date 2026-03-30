'use client'

interface ArrearsTagProps {
  amount: number
}

export default function ArrearsTag({ amount }: ArrearsTagProps) {
  if (amount <= 0) return null

  return (
    <span
      title="Unpaid balance carried from previous term"
      className="inline-flex items-center rounded-full bg-[var(--amber-dim)] border border-[var(--amber)] text-[var(--amber)] font-mono text-[11px] px-2 py-0.5 cursor-help"
    >
      KES {amount.toLocaleString('en-KE')} arrears
    </span>
  )
}
