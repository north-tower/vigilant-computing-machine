import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { 
  FeeStructure, 
  FeeBalance, 
  FeePayment, 
  DeficitTrajectory, 
  MpesaTransaction, 
  Form, 
  Stream,
  Term 
} from '@/types'

export function useFeeStructures(filters?: { form?: string; term?: string; year?: string }) {
  return useQuery<FeeStructure[], Error>({
    queryKey: ['fee-structures', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/fee-structures', { params: filters })
      return data
    },
  })
}

export function useStudentBalance(studentId: string) {
  return useQuery<FeeBalance, Error>({
    queryKey: ['balance', 'student', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/balance/student/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })
}

export function useClassBalances(form: Form, stream: Stream) {
  return useQuery<FeeBalance[], Error>({
    queryKey: ['balance', 'class', { form, stream }],
    queryFn: async () => {
      const { data } = await api.get('/finance/balance/class', { params: { form, stream } })
      return data
    },
    enabled: !!form && !!stream,
  })
}

export function useStudentPayments(studentId: string) {
  return useQuery<FeePayment[], Error>({
    queryKey: ['payments', 'student', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/payments/student/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })
}

export function useDeficitTrajectory(form: Form, term: Term, year: string) {
  return useQuery<DeficitTrajectory, Error>({
    queryKey: ['finance', 'trajectory', { form, term, year }],
    queryFn: async () => {
      const { data } = await api.get('/finance/trajectory', { params: { form, term, year } })
      return data
    },
    enabled: !!form && !!term && !!year,
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  return useMutation<FeePayment, Error, any>({
    mutationFn: async (paymentData) => {
      const { data } = await api.post('/finance/payments', paymentData)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['balance', 'student', data.student.id] })
      queryClient.invalidateQueries({ queryKey: ['payments', 'student', data.student.id] })
      queryClient.invalidateQueries({ queryKey: ['balance', 'class'] })
    },
  })
}

export function useInitiateSTKPush() {
  return useMutation<MpesaTransaction, Error, any>({
    mutationFn: async (stkData) => {
      const { data } = await api.post('/mpesa/stk-push', stkData)
      return data
    },
  })
}

export function useTransactionStatus(checkoutRequestId: string, enabled: boolean) {
  return useQuery<MpesaTransaction, Error>({
    queryKey: ['mpesa-status', checkoutRequestId],
    queryFn: async () => {
      const { data } = await api.get(`/mpesa/status/${checkoutRequestId}`)
      return data
    },
    enabled: !!checkoutRequestId && enabled,
    refetchInterval: enabled ? 3000 : false,
  })
}
