import { supabaseAdmin } from '../../supabaseAdmin.js'

const withPrimaryKeyFilters = <TQuery>(
  query: TQuery,
  keys: Record<string, unknown>
) => {
  // Supabase dynamic filters require runtime composition.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nextQuery: any = query
  for (const [key, value] of Object.entries(keys)) {
    nextQuery = nextQuery.eq(key, value)
  }
  return nextQuery
}

export const listAdminRows = async (table: string, limit: number) => {
  const { data, error } = await supabaseAdmin.from(table).select('*').limit(limit)
  if (error) {
    throw new Error(error.message || 'Database error')
  }
  return data || []
}

export const insertAdminRow = async (
  table: string,
  row: Record<string, unknown>
) => {
  const { data, error } = await supabaseAdmin
    .from(table)
    .insert(row)
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Database error')
  }

  return data || null
}

export const updateAdminRow = async (
  table: string,
  keys: Record<string, unknown>,
  row: Record<string, unknown>
) => {
  const query = withPrimaryKeyFilters(supabaseAdmin.from(table).update(row), keys)
  const { data, error } = await query.select('*').limit(1).maybeSingle()

  if (error) {
    throw new Error(error.message || 'Database error')
  }

  return data || null
}

export const deleteAdminRow = async (
  table: string,
  keys: Record<string, unknown>
) => {
  const query = withPrimaryKeyFilters(supabaseAdmin.from(table).delete(), keys)
  const { error } = await query

  if (error) {
    throw new Error(error.message || 'Database error')
  }
}
