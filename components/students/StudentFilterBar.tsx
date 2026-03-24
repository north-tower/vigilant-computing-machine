import { Form, Stream } from '@/types'

interface StudentFilterBarProps {
  filters: {
    form: string
    stream: string
    gender: string
    search: string
  }
  onFilterChange: (filters: any) => void
}

export default function StudentFilterBar({ filters, onFilterChange }: StudentFilterBarProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <input
        type="text"
        name="search"
        placeholder="Search by name or admission..."
        value={filters.search}
        onChange={handleInputChange}
        className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none"
      />
      <select 
        name="form" 
        value={filters.form} 
        onChange={handleInputChange}
        className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none"
      >
        <option value="">All Forms</option>
        {Object.values(Form).map(f => <option key={f} value={f}>{f.replace('_', ' ').toUpperCase()}</option>)}
      </select>
      <select 
        name="stream" 
        value={filters.stream} 
        onChange={handleInputChange}
        className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none"
      >
        <option value="">All Streams</option>
        {Object.values(Stream).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select 
        name="gender" 
        value={filters.gender} 
        onChange={handleInputChange}
        className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text focus:border-accent outline-none"
      >
        <option value="">All Genders</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
    </div>
  )
}
