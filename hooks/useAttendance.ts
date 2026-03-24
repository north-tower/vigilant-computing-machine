import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Attendance, AttendanceSummary, GenderAttendanceSummary } from '@/types'

export function useClassAttendance(form: string, stream: string, date: string) {
  return useQuery<Attendance[], Error>({
    queryKey: ['attendance', 'class', { form, stream, date }],
    queryFn: async () => {
      const { data } = await api.get('/attendance/class', { params: { form, stream, date } })
      return data
    },
    enabled: !!form && !!stream && !!date,
  })
}

export function useAttendanceSummary(form: string, stream: string, from: string, to: string) {
  return useQuery<AttendanceSummary[], Error>({
    queryKey: ['attendance', 'summary', { form, stream, from, to }],
    queryFn: async () => {
      const { data } = await api.get('/attendance/summary', { params: { form, stream, from, to } })
      return data
    },
    enabled: !!form && !!stream && !!from && !!to,
  })
}

export function useGenderBreakdown(form: string, stream: string, from: string, to: string) {
  return useQuery<GenderAttendanceSummary, Error>({
    queryKey: ['attendance', 'gender', { form, stream, from, to }],
    queryFn: async () => {
      const { data } = await api.get('/attendance/gender', { params: { form, stream, from, to } })
      return data
    },
    enabled: !!form && !!stream && !!from && !!to,
  })
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient()
  return useMutation<any, Error, any>({
    mutationFn: (attendanceData) => api.post('/attendance/bulk', attendanceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['attendance', 'class', { form: variables.form, stream: variables.stream, date: variables.date }]
      })
    },
  })
}
