import { supabaseAdmin } from '../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const queries = [
      supabaseAdmin.from('projects').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('projects_i18n').select('project_id', { count: 'exact', head: true }).eq('locale', 'it'),
      supabaseAdmin.from('projects_i18n').select('project_id', { count: 'exact', head: true }).eq('locale', 'en'),
      supabaseAdmin.from('project_tags').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('skill_categories').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('skill_categories_i18n').select('skill_category_id', { count: 'exact', head: true }).eq('locale', 'it'),
      supabaseAdmin.from('skill_categories_i18n').select('skill_category_id', { count: 'exact', head: true }).eq('locale', 'en'),
      supabaseAdmin.from('skill_items').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('skill_items_i18n').select('skill_item_id', { count: 'exact', head: true }).eq('locale', 'it'),
      supabaseAdmin.from('skill_items_i18n').select('skill_item_id', { count: 'exact', head: true }).eq('locale', 'en'),
    ];

    const [
      projects,
      projectsIt,
      projectsEn,
      projectTags,
      skillCategories,
      skillCategoriesIt,
      skillCategoriesEn,
      skillItems,
      skillItemsIt,
      skillItemsEn,
    ] = await Promise.all(queries);

    return res.status(200).json({
      projects: projects.count || 0,
      projects_i18n_it: projectsIt.count || 0,
      projects_i18n_en: projectsEn.count || 0,
      project_tags: projectTags.count || 0,
      skill_categories: skillCategories.count || 0,
      skill_categories_i18n_it: skillCategoriesIt.count || 0,
      skill_categories_i18n_en: skillCategoriesEn.count || 0,
      skill_items: skillItems.count || 0,
      skill_items_i18n_it: skillItemsIt.count || 0,
      skill_items_i18n_en: skillItemsEn.count || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
