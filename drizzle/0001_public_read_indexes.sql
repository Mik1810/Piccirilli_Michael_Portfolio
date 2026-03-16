CREATE INDEX IF NOT EXISTS profile_i18n_locale_idx
  ON public.profile_i18n (locale);

CREATE INDEX IF NOT EXISTS hero_roles_i18n_locale_idx
  ON public.hero_roles_i18n (locale);

CREATE INDEX IF NOT EXISTS about_interests_i18n_locale_idx
  ON public.about_interests_i18n (locale);

CREATE INDEX IF NOT EXISTS projects_i18n_locale_idx
  ON public.projects_i18n (locale);

CREATE INDEX IF NOT EXISTS github_projects_featured_order_index_idx
  ON public.github_projects (featured, order_index);

CREATE INDEX IF NOT EXISTS github_projects_i18n_locale_idx
  ON public.github_projects_i18n (locale);

CREATE INDEX IF NOT EXISTS experiences_i18n_locale_idx
  ON public.experiences_i18n (locale);

CREATE INDEX IF NOT EXISTS education_i18n_locale_idx
  ON public.education_i18n (locale);

CREATE INDEX IF NOT EXISTS tech_categories_i18n_locale_idx
  ON public.tech_categories_i18n (locale);

CREATE INDEX IF NOT EXISTS skill_categories_i18n_locale_idx
  ON public.skill_categories_i18n (locale);

CREATE INDEX IF NOT EXISTS skill_items_i18n_locale_idx
  ON public.skill_items_i18n (locale);
