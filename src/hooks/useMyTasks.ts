'use client'

import { useState, useEffect, useCallback } from 'react'
import { taskService } from '@/services/task.service'
import type { MyTasksResponse, GetTasksParams } from '@/types/task.types'

export function useMyTasks(params?: GetTasksParams) {
  const [data, setData]       = useState<MyTasksResponse>({ assigned: [], personal: [] })
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await taskService.getMyTasks(params)
      setData(res)
    } catch {
      setData({ assigned: [], personal: [] })
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { refetch() }, [refetch])

  return { data, loading, refetch }
}