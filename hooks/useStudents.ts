import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Student, MedicalCard } from '@/types'

export function useStudents(filters?: { form?: string; stream?: string; gender?: string }) {
  return useQuery<Student[], Error>({
    queryKey: ['students', filters],
    queryFn: async () => {
      const { data } = await api.get('/students', { params: filters })
      return data
    },
  })
}

export function useStudent(id: string) {
  return useQuery<Student, Error>({
    queryKey: ['student', id],
    queryFn: async () => {
      const { data } = await api.get(`/students/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useMedicalCard(studentId: string) {
  return useQuery<MedicalCard, Error>({
    queryKey: ['medical-card', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/medical/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })
}
