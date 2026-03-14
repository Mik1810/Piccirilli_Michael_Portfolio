import { sqlClient } from '../client.js'

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

const quoteIdentifier = (value: string) => {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Invalid SQL identifier: ${value}`)
  }
  return `"${value}"`
}

const buildWhereClause = (
  keys: Record<string, unknown>,
  startIndex: number
) => {
  const entries = Object.entries(keys)
  const values = entries.map(([, value]) => value)
  const clause = entries
    .map(([key], index) => `${quoteIdentifier(key)} = $${startIndex + index}`)
    .join(' AND ')

  return { clause, values }
}

const ensureRowColumns = (row: Record<string, unknown>) => {
  const columns = Object.keys(row)
  if (columns.length === 0) {
    throw new Error('Missing row payload')
  }
  columns.forEach((column) => {
    quoteIdentifier(column)
  })
  return columns
}

const runUnsafe = async <TRow = Record<string, unknown>>(
  query: string,
  values: unknown[]
) => {
  try {
    return (await sqlClient.unsafe(query, values as never[])) as TRow[]
  } catch {
    throw new Error('Database error')
  }
}

export const listAdminRows = async (table: string, limit: number) => {
  const rows = await runUnsafe(
    `select * from ${quoteIdentifier(table)} limit $1`,
    [limit]
  )
  return rows
}

export const insertAdminRow = async (
  table: string,
  row: Record<string, unknown>
) => {
  const columns = ensureRowColumns(row)
  const values = columns.map((column) => row[column])
  const columnList = columns.map(quoteIdentifier).join(', ')
  const valuePlaceholders = columns.map((_, index) => `$${index + 1}`).join(', ')

  const rows = await runUnsafe(
    `insert into ${quoteIdentifier(table)} (${columnList}) values (${valuePlaceholders}) returning *`,
    values
  )

  return rows[0] || null
}

export const updateAdminRow = async (
  table: string,
  keys: Record<string, unknown>,
  row: Record<string, unknown>
) => {
  const columns = ensureRowColumns(row)
  const setValues = columns.map((column) => row[column])
  const setClause = columns
    .map((column, index) => `${quoteIdentifier(column)} = $${index + 1}`)
    .join(', ')
  const where = buildWhereClause(keys, columns.length + 1)

  const rows = await runUnsafe(
    `update ${quoteIdentifier(table)} set ${setClause} where ${where.clause} returning *`,
    [...setValues, ...where.values]
  )

  return rows[0] || null
}

export const deleteAdminRow = async (
  table: string,
  keys: Record<string, unknown>
) => {
  const where = buildWhereClause(keys, 1)
  await runUnsafe(
    `delete from ${quoteIdentifier(table)} where ${where.clause}`,
    where.values
  )
}
