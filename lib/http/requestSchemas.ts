import { z } from 'zod'

export const localeQuerySchema = z.object({
  lang: z.enum(['it', 'en']).optional(),
})

const nonEmptyRecordSchema = z
  .record(z.string(), z.unknown())
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Record payload cannot be empty',
  })

export const adminLoginBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email e password obbligatorie')
    .max(320, 'Email e password obbligatorie')
    .email('Email non valida'),
  password: z
    .string()
    .trim()
    .min(1, 'Email e password obbligatorie')
    .max(4096, 'Email e password obbligatorie'),
})

export const adminTableQuerySchema = z.object({
  table: z.string().trim().min(1, 'Missing table parameter'),
  limit: z.string().trim().optional(),
})

export const adminTableBodySchema = z
  .object({
    row: nonEmptyRecordSchema.optional(),
    rows: z.array(nonEmptyRecordSchema).min(1).optional(),
    keys: nonEmptyRecordSchema.optional(),
  })
  .strict()

export const contactBodySchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .max(320, 'Email is too long')
      .email('Email is invalid'),
    message: z
      .string()
      .trim()
      .min(1, 'Message is required')
      .max(4000, 'Message is too long'),
    locale: z.enum(['it', 'en']).default('it'),
    website: z.string().trim().max(0, 'Invalid request payload').default(''),
  })
  .strict()
