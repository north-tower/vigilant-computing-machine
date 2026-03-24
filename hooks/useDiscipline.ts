import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { DisciplineIncident, DisciplineScore, Form, Stream } from '@/types'

export function useIncidents(filters?: { form?: string; stream?: string; status?: string; severity?: string; from?: string; to?: string }) {
  return useQuery<DisciplineIncident[], Error>({
    queryKey: ['incidents', filters],
    queryFn: async () => {
      const { data } = await api.get('/discipline/class', { params: filters })
      return data
    },
  })
}

export function useOpenIncidents() {
  return useQuery<DisciplineIncident[], Error>({
    queryKey: ['incidents', 'open'],
    queryFn: async () => {
      const { data } = await api.get('/discipline/open')
      return data
    },
  })
}

export function useStudentIncidents(studentId: string) {
  return useQuery<DisciplineIncident[], Error>({
    queryKey: ['incidents', 'student', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/discipline/student/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })
}

export function useDisciplineScore(studentId: string) {
  return useQuery<DisciplineScore, Error>({
    queryKey: ['discipline-score', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/discipline/score/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })
}

export function useClassScoreboard(form: Form, stream: Stream) {
  return useQuery<DisciplineScore[], Error>({
    queryKey: ['discipline-scoreboard', { form, stream }],
    queryFn: async () => {
      const { data } = await api.get('/discipline/scoreboard', { params: { form, stream } })
      return data
    },
    enabled: !!form && !!stream,
  })
}

export function useReportIncident() {
  const queryClient = useQueryClient()
  return useMutation<DisciplineIncident, Error, any>({
    mutationFn: async (incidentData) => {
      const { data } = await api.post('/discipline', incidentData)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['discipline-score', data.student.id] })
    },
  })
}

export function useUpdateIncident() {
  const queryClient = useQueryClient()
  return useMutation<DisciplineIncident, Error, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => {
      const { data: responseData } = await api.patch(`/discipline/${id}`, data)
      return responseData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })
}
