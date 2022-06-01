import React from 'react'
import type { ZodRawShape } from 'zod';
import { z } from 'zod'

export default function useObjSchema<T extends ZodRawShape>(schema: T) {
  const cb = () => z.object(schema)
  return React.useMemo(cb, [])
}
