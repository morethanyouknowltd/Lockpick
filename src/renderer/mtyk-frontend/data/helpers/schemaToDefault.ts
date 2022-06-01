import type { z, ZodSchema } from 'zod'

export default function schemaToDefault<A, B, C>(
  zodSchema: ZodSchema<A, B, C>
): z.infer<typeof zodSchema> {
  let out: any = {}
  for (const key in (zodSchema as any).shape) {
    let val = ''
    // todo check type other than string
    out[key] = val
  }
  return out
}
