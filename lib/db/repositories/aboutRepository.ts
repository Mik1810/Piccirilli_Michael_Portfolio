import { supabaseAdmin } from '../../supabaseAdmin.js'
import type { RepositoryLocale } from './projectsRepository.js'

interface AboutBaseRow {
  id: number
  order_index?: number | null
}

interface AboutI18nRow {
  about_interest_id: number
  interest?: string | null
}

export interface AboutResponse {
  interests: string[]
}

export const fetchAbout = async (
  locale: RepositoryLocale
): Promise<AboutResponse> => {
  const [
    { data: baseRows, error: baseError },
    { data: i18nRows, error: i18nError },
  ] = await Promise.all([
    supabaseAdmin
      .from('about_interests')
      .select('id, order_index')
      .order('order_index', { ascending: true }),
    supabaseAdmin
      .from('about_interests_i18n')
      .select('about_interest_id, interest')
      .eq('locale', locale),
  ])

  if (baseError || i18nError) {
    throw new Error('Database error')
  }

  const labelById = new Map(
    ((i18nRows || []) as AboutI18nRow[]).map((row) => [
      row.about_interest_id,
      row.interest || '',
    ])
  )

  return {
    interests: ((baseRows || []) as AboutBaseRow[])
      .map((row) => labelById.get(row.id))
      .filter(Boolean) as string[],
  }
}
