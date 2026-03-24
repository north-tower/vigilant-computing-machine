'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { MessagePriority } from '@/types'
import { useSendMessage, useInbox } from '@/hooks/useComms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import PriorityBadge from './PriorityBadge'

const messageSchema = z.object({
  subject: z.string().min(3).max(100),
  priority: z.nativeEnum(MessagePriority),
  body: z.string().min(10).max(1000),
})

type MessageFormData = z.infer<typeof messageSchema>

export default function MessageComposer() {
  const sendMessageMutation = useSendMessage()
  // Fetch sent messages (placeholder logic as per prompt)
  const { data: sentMessages } = useInbox() 

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      priority: MessagePriority.NORMAL,
    }
  })

  const bodyValue = watch('body') || ''
  const selectedPriority = watch('priority')

  const onSubmit = async (data: MessageFormData) => {
    try {
      await sendMessageMutation.mutateAsync(data)
      toast.success('Message sent to Principal')
      reset()
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  const priorityOptions = [
    { value: MessagePriority.NORMAL, label: 'Normal' },
    { value: MessagePriority.ACADEMIC, label: 'Academic' },
    { value: MessagePriority.FINANCIAL, label: 'Financial' },
    { value: MessagePriority.URGENT, label: 'Urgent' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="bg-surface border border-border rounded-xl p-8 space-y-8 shadow-2xl">
        <h2 className="font-display text-2xl text-text">Send Message to Principal</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input 
              placeholder="e.g. Inquiry regarding Term 2 fees" 
              {...register('subject')} 
              className={cn(errors.subject && "border-danger focus:ring-danger")}
            />
            {errors.subject && <p className="text-[10px] text-danger font-bold uppercase">{errors.subject.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Priority Level</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('priority', opt.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-2",
                    selectedPriority === opt.value 
                      ? "ring-2 ring-accent border-accent bg-accent-dim" 
                      : "bg-bg border-border text-text-muted hover:border-text-faint"
                  )}
                >
                  <PriorityBadge priority={opt.value} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Message Body</Label>
            <Textarea 
              placeholder="Write your message here..." 
              rows={6}
              {...register('body')}
              className={cn(errors.body && "border-danger focus:ring-danger")}
            />
            <div className="flex justify-between items-center">
              {errors.body ? (
                <p className="text-[10px] text-danger font-bold uppercase">{errors.body.message}</p>
              ) : <div />}
              <span className={cn(
                "text-[10px] font-mono",
                bodyValue.length > 1000 ? "text-danger" : "text-text-faint"
              )}>
                {bodyValue.length} / 1000
              </span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent text-bg font-bold h-12 flex items-center justify-center gap-2"
            disabled={sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-xl text-text">Your previous messages</h3>
        <div className="bg-surface border border-border border-dashed rounded-xl p-8 text-center text-text-muted italic text-sm">
          Message history coming soon
        </div>
      </div>
    </div>
  )
}
