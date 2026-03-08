import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map();

const firstDefined = (...vals) => vals.find((v) => v !== undefined && v !== null);

const projectFk = (row) =>
  firstDefined(
    row.project_id,
    row.projects_id,
    row.projectId,
    row.id_project,
    row.idProject,
    row.id
  );

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lang = req.query?.lang === 'en' ? 'en' : 'it';
  const cacheKey = `projects:${lang}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(cached.value);
  }

  try {
    const [
      { data: projectRows, error: projectError },
      { data: i18nRows, error: i18nError },
      { data: tagRows, error: tagError },
      { data: i18nFallbackRows, error: i18nFallbackError },
    ] = await Promise.all([
      supabaseAdmin
        .from('projects')
        .select('*'),
      supabaseAdmin
        .from('projects_i18n')
        .select('*')
        .eq('locale', lang),
      supabaseAdmin
        .from('project_tags')
        .select('*'),
      supabaseAdmin
        .from('projects_i18n')
        .select('*')
        .eq('locale', lang === 'it' ? 'en' : 'it'),
    ]);

    if (projectError || i18nError || tagError || i18nFallbackError) {
      console.error('Supabase error:', {
        projectError,
        i18nError,
        tagError,
        i18nFallbackError,
      });
      return res.status(500).json({ error: 'Database error' });
    }

    const textByProjectId = new Map(
      (i18nRows || [])
        .map((row) => [projectFk(row), row])
        .filter(([id]) => id !== undefined && id !== null)
    );
    const fallbackTextByProjectId = new Map(
      (i18nFallbackRows || [])
        .map((row) => [projectFk(row), row])
        .filter(([id]) => id !== undefined && id !== null)
    );
    const tagsByProjectId = new Map();
    const sortedTags = (tagRows || [])
      .slice()
      .sort((a, b) => (a.order_index ?? a.id ?? 0) - (b.order_index ?? b.id ?? 0));
    for (const row of sortedTags) {
      const projectId = projectFk(row);
      if (!projectId) continue;
      if (!tagsByProjectId.has(projectId)) tagsByProjectId.set(projectId, []);
      tagsByProjectId.get(projectId).push(row.tag ?? row.name ?? '');
    }

    const sortedProjects = (projectRows || [])
      .slice()
      .sort((a, b) => (a.order_index ?? a.id ?? 0) - (b.order_index ?? b.id ?? 0));

    let payload = sortedProjects
      .map((row) => {
        const i18n = textByProjectId.get(row.id);
        const i18nFallback = fallbackTextByProjectId.get(row.id);
        return {
          id: row.id,
          slug: row.slug ?? `project-${row.id}`,
          title: i18n?.title ?? i18nFallback?.title ?? row.title ?? '',
          description:
            i18n?.description ??
            i18nFallback?.description ??
            row.description ??
            '',
          tags: tagsByProjectId.get(row.id) || [],
          live: row.live_url ?? row.live ?? null,
          github: row.github_url ?? row.github ?? null,
        };
      })
      .filter((row) => row.title);

    if (payload.length === 0) {
      return res.status(500).json({
        error:
          'No project rows found in DB. Ensure projects, projects_i18n, and project_tags are populated.',
      });
    }

    cache.set(cacheKey, { at: Date.now(), value: payload });
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(payload);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
