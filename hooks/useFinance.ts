import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  FeeStructure,
  StudentFeeAccount,
  FeeAccountStatus,
  FeePayment,
  DeficitTrajectory,
  MpesaTransaction,
} from '@/types'

export function useFeeStructures(filters?: { form?: string; term?: string; year?: string }) {
  const query = useQuery<FeeStructure[], Error>({
    queryKey: ['fee-structures', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/fee-structures', { params: filters })
      return data
    },
  })
  return { feeStructures: query.data || [], isLoading: query.isLoading, error: query.error }
}

export function useFeeStructure(id: string) {
  const { feeStructures, isLoading } = useFeeStructures()
  return { feeStructure: feeStructures.find((item) => item.id === id), isLoading }
}

export function useTermAccounts(filters: {
  feeStructureId?: string
  status?: FeeAccountStatus
  form?: string
  stream?: string
}) {
  const query = useQuery<StudentFeeAccount[], Error>({
    queryKey: ['fee-accounts', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/fee-accounts', { params: filters })
      return data
    },
    enabled: !!filters.feeStructureId || !!filters.form,
  })
  return { accounts: query.data || [], isLoading: query.isLoading, error: query.error }
}

export function useStudentFeeHistory(studentId: string) {
  const query = useQuery<StudentFeeAccount[], Error>({
    queryKey: ['fee-history', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/fee-accounts/student/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })
  return { history: query.data || [], isLoading: query.isLoading, error: query.error }
}

export function useFeeAccount(id: string) {
  const query = useQuery<StudentFeeAccount, Error>({
    queryKey: ['fee-account', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/fee-accounts/${id}`)
      return data
    },
    enabled: !!id,
  })
  return { account: query.data, isLoading: query.isLoading, error: query.error }
}

export function useDeficitTrajectory(feeStructureId: string) {
  const query = useQuery<DeficitTrajectory, Error>({
    queryKey: ['trajectory', feeStructureId],
    queryFn: async () => {
      const { data } = await api.get('/finance/fee-accounts/trajectory', { params: { feeStructureId } })
      return data
    },
    enabled: !!feeStructureId && feeStructureId.length === 36,
  })
  return { trajectory: query.data, isLoading: query.isLoading, error: query.error }
}

export function useBulkAssignFees() {
  const queryClient = useQueryClient()
  const mutation = useMutation<{ created: number; skipped: number; total: number }, Error, { feeStructureId: string }>({
    mutationFn: async (payload) => (await api.post('/finance/fee-accounts/bulk-assign', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] })
    },
  })
  return { mutate: mutation.mutate, mutateAsync: mutation.mutateAsync, isLoading: mutation.isPending, data: mutation.data, error: mutation.error }
}

export function useApplyExemption() {
  const queryClient = useQueryClient()
  const mutation = useMutation<StudentFeeAccount, Error, { id: string; amount: number; reason: string }>({
    mutationFn: async ({ id, ...payload }) => (await api.post(`/finance/fee-accounts/${id}/exemption`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['fee-history'] })
    },
  })
  return { mutate: mutation.mutate, mutateAsync: mutation.mutateAsync, isLoading: mutation.isPending, error: mutation.error }
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  const mutation = useMutation<FeePayment, Error, any>({
    mutationFn: async (paymentData) => (await api.post('/finance/payments', paymentData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['fee-history'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
  return { mutate: mutation.mutate, mutateAsync: mutation.mutateAsync, isLoading: mutation.isPending, error: mutation.error }
}

export function useStudentPayments(studentId: string) {
  const query = useQuery<FeePayment[], Error>({
    queryKey: ['payments', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/payments/student/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })
  return { payments: query.data || [], isLoading: query.isLoading, error: query.error }
}

export function useInitiateSTKPush() {
  const queryClient = useQueryClient()
  return useMutation<MpesaTransaction, Error, any>({
    mutationFn: async (stkData) => {
      try {
        return (await api.post('/mpesa/stk-push', stkData)).data
      } catch {
        return (await api.post('/mpesa/stkpush', stkData)).data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-accounts'] })
    },
  })
}

export function useTransactionStatus(checkoutRequestId: string, enabled: boolean) {
  return useQuery<MpesaTransaction, Error>({
    queryKey: ['mpesa-status', checkoutRequestId],
    queryFn: async () => (await api.get(`/mpesa/status/${checkoutRequestId}`)).data,
    enabled: !!checkoutRequestId && enabled,
    refetchInterval: enabled ? 3000 : false,
  })
}
