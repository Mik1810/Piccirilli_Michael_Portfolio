import { supabaseAdmin } from '../../supabaseAdmin.js'

export type RepositoryLocale = 'it' | 'en'

interface ProjectRecord {
  id: number | string
  slug?: string | null
  order_index?: number | null
  live_url?: string | null
}

interface ProjectI18nRecord {
  project_id?: number | string | null
  projects_id?: number | string | null
  id_project?: number | string | null
  projectId?: number | string | null
  title?: string | null
  description?: string | null
}

interface ProjectTagRecord {
  project_id?: number | string | null
  projects_id?: number | string | null
  id_project?: number | string | null
  projectId?: number | string | null
  order_index?: number | null
  tag?: string | null
  name?: string | null
  value?: string | null
}

interface GithubProjectRecord {
  id: number | string
  slug?: string | null
  order_index?: number | null
  github_url?: string | null
  live_url?: string | null
  image_url?: string | null
  featured?: boolean | null
}

interface GithubProjectI18nRecord {
  github_project_id?: number | string | null
  github_projects_id?: number | string | null
  id_github_project?: number | string | null
  githubProjectId?: number | string | null
  title?: string | null
  description?: string | null
}

interface GithubProjectTagRecord {
  github_project_id?: number | string | null
  github_projects_id?: number | string | null
  id_github_project?: number | string | null
  githubProjectId?: number | string | null
  order_index?: number | null
  tag?: string | null
  name?: string | null
  value?: string | null
}

interface GithubProjectImageRecord {
  github_project_id?: number | string | null
  github_projects_id?: number | string | null
  id_github_project?: number | string | null
  githubProjectId?: number | string | null
  order_index?: number | null
  image_url?: string | null
  url?: string | null
}

export interface ProjectSummary {
  id: number | string
  slug: string
  title: string
  description: string
  tags: string[]
  live: string | null
  github: null
}

export interface GithubProjectSummary {
  id: number | string
  slug: string
  title: string
  description: string
  tags: string[]
  githubUrl: string | null
  liveUrl: string | null
  image: string | null
  images: string[]
}

export interface ProjectsResponse {
  projects: ProjectSummary[]
  githubProjects: GithubProjectSummary[]
}

const keyOf = (value: unknown) =>
  value === undefined || value === null ? null : String(value)

const pick = <T>(...values: Array<T | undefined | null>) =>
  values.find((value) => value !== undefined && value !== null)

const isMissingRelationError = (error: { code?: string; message?: string } | null) =>
  error?.code === 'PGRST205' ||
  error?.code === '42P01' ||
  /could not find the table|relation .* does not exist/i.test(error?.message || '')

export const normalizeRepositoryLocale = (value: string | undefined): RepositoryLocale =>
  value === 'en' ? 'en' : 'it'

export const fetchProjects = async (
  locale: RepositoryLocale
): Promise<ProjectsResponse> => {
  const [
    { data: projectsBase, error: projectsError },
    { data: i18nRows, error: i18nError },
    { data: tagsRows, error: tagsError },
    { data: githubBase, error: githubBaseError },
    { data: githubI18nRows, error: githubI18nError },
    { data: githubTagsRows, error: githubTagsError },
    { data: githubImagesRows, error: githubImagesError },
  ] = await Promise.all([
    supabaseAdmin
      .from('projects')
      .select('id, slug, order_index, live_url')
      .order('order_index', { ascending: true }),
    supabaseAdmin
      .from('projects_i18n')
      .select('project_id, title, description')
      .eq('locale', locale),
    supabaseAdmin
      .from('project_tags')
      .select('project_id, order_index, tag')
      .order('order_index', { ascending: true }),
    supabaseAdmin
      .from('github_projects')
      .select('id, slug, order_index, github_url, live_url, image_url, featured')
      .eq('featured', true)
      .order('order_index', { ascending: true }),
    supabaseAdmin
      .from('github_projects_i18n')
      .select('github_project_id, title, description')
      .eq('locale', locale),
    supabaseAdmin
      .from('github_project_tags')
      .select('github_project_id, order_index, tag')
      .order('order_index', { ascending: true }),
    supabaseAdmin
      .from('github_project_images')
      .select('github_project_id, order_index, image_url, alt_text')
      .order('order_index', { ascending: true }),
  ])

  const githubImagesMissing = isMissingRelationError(githubImagesError)

  if (
    projectsError ||
    i18nError ||
    tagsError ||
    githubBaseError ||
    githubI18nError ||
    githubTagsError ||
    (githubImagesError && !githubImagesMissing)
  ) {
    throw new Error('Database error')
  }

  if (githubImagesMissing) {
    console.warn(
      'github_project_images table not found, falling back to image_url previews'
    )
  }

  const textByProjectId = new Map(
    ((i18nRows || []) as ProjectI18nRecord[]).map((row) => [
      keyOf(pick(row.project_id, row.projects_id, row.id_project, row.projectId)),
      row,
    ])
  )

  const tagsByProjectId = new Map<string, string[]>()
  for (const row of (tagsRows || []) as ProjectTagRecord[]) {
    const projectId = keyOf(
      pick(row.project_id, row.projects_id, row.id_project, row.projectId)
    )
    if (!projectId) continue
    if (!tagsByProjectId.has(projectId)) tagsByProjectId.set(projectId, [])
    tagsByProjectId.get(projectId)?.push(pick(row.tag, row.name, row.value, '') || '')
  }

  const projects = ((projectsBase || []) as ProjectRecord[]).map((row) => {
    const rowKey = keyOf(row.id)
    const i18n = rowKey ? textByProjectId.get(rowKey) : undefined
    return {
      id: row.id,
      slug: row.slug || `project-${row.id}`,
      title: i18n?.title || '',
      description: i18n?.description || '',
      tags: (rowKey && tagsByProjectId.get(rowKey)) || [],
      live: row.live_url || null,
      github: null,
    }
  })

  const githubTextByProjectId = new Map(
    ((githubI18nRows || []) as GithubProjectI18nRecord[]).map((row) => [
      keyOf(
        pick(
          row.github_project_id,
          row.github_projects_id,
          row.id_github_project,
          row.githubProjectId
        )
      ),
      row,
    ])
  )

  const githubTagsByProjectId = new Map<string, string[]>()
  for (const row of (githubTagsRows || []) as GithubProjectTagRecord[]) {
    const projectId = keyOf(
      pick(
        row.github_project_id,
        row.github_projects_id,
        row.id_github_project,
        row.githubProjectId
      )
    )
    if (!projectId) continue
    if (!githubTagsByProjectId.has(projectId)) githubTagsByProjectId.set(projectId, [])
    githubTagsByProjectId
      .get(projectId)
      ?.push(pick(row.tag, row.name, row.value, '') || '')
  }

  const githubImagesByProjectId = new Map<string, string[]>()
  for (const row of (githubImagesRows || []) as GithubProjectImageRecord[]) {
    const projectId = keyOf(
      pick(
        row.github_project_id,
        row.github_projects_id,
        row.id_github_project,
        row.githubProjectId
      )
    )
    if (!projectId) continue
    if (!githubImagesByProjectId.has(projectId)) {
      githubImagesByProjectId.set(projectId, [])
    }
    const image = pick(row.image_url, row.url, '') || ''
    if (image) githubImagesByProjectId.get(projectId)?.push(image)
  }

  const githubProjects = ((githubBase || []) as GithubProjectRecord[]).map((row) => {
    const rowKey = keyOf(row.id)
    const i18n = rowKey ? githubTextByProjectId.get(rowKey) : undefined
    return {
      id: row.id,
      slug: row.slug || `github-project-${row.id}`,
      title: i18n?.title || '',
      description: i18n?.description || '',
      tags: (rowKey && githubTagsByProjectId.get(rowKey)) || [],
      githubUrl: row.github_url || null,
      liveUrl: row.live_url || null,
      image: row.image_url || null,
      images: (rowKey && githubImagesByProjectId.get(rowKey)) || [],
    }
  })

  return { projects, githubProjects }
}
