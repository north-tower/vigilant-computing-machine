import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { AuthUser, UserRole } from '@/types'

export function useStaff(role?: UserRole) {
  return useQuery<AuthUser[], Error>({
    queryKey: ['staff', role],
    queryFn: async () => {
      const { data } = await api.get('/users', { params: { role } })
      return data
    },
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation<AuthUser, Error, any>({
    mutationFn: async (staffData) => {
      const { data } = await api.post('/users', staffData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}
