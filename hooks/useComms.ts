import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Message, MessagePriority, TriageLabel } from '@/types'

export function useInbox(filters?: { is_read?: boolean; priority?: MessagePriority; triage_label?: TriageLabel }) {
  const query = useQuery<Message[], Error>({
    queryKey: ['inbox', filters],
    queryFn: async () => {
      const { data } = await api.get('/comms/messages', { params: filters })
      return data
    },
  })

  const unreadCount = query.data?.filter(m => !m.is_read).length || 0

  return { ...query, unreadCount }
}

export function useMessage(id: string) {
  return useQuery<Message, Error>({
    queryKey: ['message', id],
    queryFn: async () => {
      const { data } = await api.get(`/comms/messages/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await api.patch(`/comms/messages/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation<Message, Error, { subject: string; body: string; priority: MessagePriority }>({
    mutationFn: async (messageData) => {
      const { data } = await api.post('/comms/messages', messageData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] })
    },
  })
}
