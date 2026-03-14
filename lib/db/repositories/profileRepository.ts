import { supabaseAdmin } from '../../supabaseAdmin.js'
import {
  normalizeRepositoryLocale,
  type RepositoryLocale,
} from './projectsRepository.js'

interface ProfileRow {
  id: number
  full_name?: string | null
  photo_url?: string | null
  email?: string | null
  cv_url?: string | null
  university_logo_url?: string | null
}

interface ProfileI18nRow {
  locale?: RepositoryLocale
  greeting?: string | null
  location?: string | null
  university_name?: string | null
  bio?: string | null
}

interface SocialRow {
  order_index?: number | null
  name?: string | null
  url?: string | null
  icon_key?: string | null
}

interface HeroRoleBaseRow {
  id: number
  order_index?: number | null
}

interface HeroRoleI18nRow {
  hero_role_id: number
  role?: string | null
}

export interface ProfileResponse {
  name: string
  photo: string
  email: string
  cv: string
  greeting: string
  location: string
  bio: string
  university: {
    name: string
    logo: string
  }
  roles: string[]
  socials: Array<{
    name: string
    url: string
    icon: string
  }>
}

export { normalizeRepositoryLocale }

export const fetchProfile = async (
  locale: RepositoryLocale
): Promise<ProfileResponse> => {
  const [
    { data: profileRow, error: profileError },
    profileI18nResult,
    { data: socialRows, error: socialError },
    { data: roleBaseRows, error: roleBaseError },
    { data: roleI18nRows, error: roleI18nError },
  ] = await Promise.all([
    supabaseAdmin
      .from('profile')
      .select('id, full_name, photo_url, email, cv_url, university_logo_url')
      .eq('id', 1)
      .single(),
    supabaseAdmin
      .from('profile_i18n')
      .select('locale, greeting, location, university_name, bio')
      .eq('profile_id', 1)
      .eq('locale', locale),
    supabaseAdmin
      .from('social_links')
      .select('order_index, name, url, icon_key')
      .eq('profile_id', 1)
      .order('order_index', { ascending: true }),
    supabaseAdmin
      .from('hero_roles')
      .select('id, order_index')
      .order('order_index', { ascending: true }),
    supabaseAdmin
      .from('hero_roles_i18n')
      .select('hero_role_id, role')
      .eq('locale', locale),
  ])

  let profileI18nRows = profileI18nResult.data as ProfileI18nRow[] | null
  let profileI18nError = profileI18nResult.error

  if (profileI18nError?.code === '42703') {
    const fallback = await supabaseAdmin
      .from('profile_i18n')
      .select('locale, greeting, location, university_name')
      .eq('profile_id', 1)
      .eq('locale', locale)
    profileI18nRows = fallback.data as ProfileI18nRow[] | null
    profileI18nError = fallback.error
  }

  if (
    profileError ||
    profileI18nError ||
    socialError ||
    roleBaseError ||
    roleI18nError
  ) {
    throw new Error('Database error')
  }

  const profile = profileRow as ProfileRow | null
  const profileI18n = (profileI18nRows || [])[0] || {}
  const roleById = new Map(
    ((roleI18nRows || []) as HeroRoleI18nRow[]).map((row) => [row.hero_role_id, row.role || ''])
  )
  const roles = ((roleBaseRows || []) as HeroRoleBaseRow[])
    .map((row) => roleById.get(row.id))
    .filter(Boolean) as string[]

  return {
    name: profile?.full_name || '',
    photo: profile?.photo_url || '',
    email: profile?.email || '',
    cv: profile?.cv_url || '',
    greeting: profileI18n.greeting || '',
    location: profileI18n.location || '',
    bio: profileI18n.bio || '',
    university: {
      name: profileI18n.university_name || '',
      logo: profile?.university_logo_url || '',
    },
    roles,
    socials: ((socialRows || []) as SocialRow[]).map((row) => ({
      name: row.name || '',
      url: row.url || '',
      icon: row.icon_key || '',
    })),
  }
}
