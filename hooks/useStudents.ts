import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Student, MedicalCard, Form, Stream } from '@/types'

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

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation<Student, Error, { 
    full_name: string; 
    admission_number: string; 
    form: Form; 
    stream: Stream; 
    gender: 'male' | 'female'; 
    date_of_birth?: string;
    parent_name?: string;
    parent_phone?: string;
  }>({
    mutationFn: async (studentData) => {
      const { data } = await api.post('/students', studentData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useLinkChild() {
  const queryClient = useQueryClient()
  return useMutation<Student, Error, string>({
    mutationFn: async (admission_number: string) => {
      const { data } = await api.post('/students/link-parent', { admission_number })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
