import { useState } from 'react'
import useAsyncEffect from 'use-async-effect'

export default function usePaginatedAdapter<D = any>(
  getData: ({ page }: { page: number }) => Promise<D[]>
) {
  const [allData, setAllData] = useState<D[]>([])
  const [page, setPage] = useState(0)
  const [error, setError] = useState(null)

  // Used incase the page is still 0
  // but we want to trigger a reset via rerender
  const [resetCount, setResetCount] = useState(0)

  useAsyncEffect(
    async (isMounted: () => boolean) => {
      if (!isMounted()) {
        return
      }
      setError(false)
      try {
        const data = await getData({ page })
        if (!isMounted()) {
          return
        }
        if (page === 0) {
          setAllData(data)
        } else {
          setAllData(allData.concat(data))
        }
      } catch (e) {
        if (!isMounted()) {
          return
        }
        setError(e)
        console.error(e)
      }
    },
    [page, resetCount]
  )

  return {
    setPage,
    reset: () => {
      setAllData([])
      if (page === 0) {
        setResetCount(resetCount + 1)
      } else {
        setPage(0)
      }
    },
    page,
    data: allData,
    error,
  }
}
