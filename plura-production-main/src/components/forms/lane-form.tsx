'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { Funnel, Lane, Pipeline } from '@prisma/client'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { LaneFormSchema } from '@/lib/types'
import {
  getPipelineDetails,
  saveActivityLogsNotification,
  upsertFunnel,
  upsertLane,
  upsertPipeline,
} from '@/lib/queries'
import { v4 } from 'uuid'
import { toast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

interface CreateLaneFormProps {
  defaultData?: Lane
  pipelineId: string
}

const LaneForm: React.FC<CreateLaneFormProps> = ({
  defaultData,
  pipelineId,
}) => {
  const { setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof LaneFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(LaneFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
      color: defaultData?.color || '#000000',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || '',
        color: defaultData.color || '#000000',
      })
    }
  }, [defaultData])

  const isLoading = form.formState.isLoading

  const onSubmit = async (values: z.infer<typeof LaneFormSchema>) => {
    if (!pipelineId) return
    try {
      const response = await upsertLane({
        ...values,
        id: defaultData?.id || v4(),
        pipelineId: pipelineId,
        order: defaultData?.order ?? 0,
      })

      if (!response) {
        throw new Error('Failed to create lane')
      }

      const pipelineDetails = await getPipelineDetails(pipelineId)
      if (!pipelineDetails) {
        throw new Error('Pipeline not found')
      }

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a lane | ${response.name}`,
        subaccountId: pipelineDetails.subAccountId,
      })

      toast({
        title: 'Success',
        description: 'Saved lane successfully',
      })

      setClose()
      router.refresh()
    } catch (error) {
      console.error('Lane form error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not save pipeline details',
      })
    }
  }
  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Lane Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lane Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        placeholder="Select Color"
                        {...field}
                        className="w-20 h-10"
                      />
                      <span className="text-sm text-muted-foreground">{field.value}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-20 mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default LaneForm
