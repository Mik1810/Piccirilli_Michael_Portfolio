import { asc, eq } from 'drizzle-orm'

import { db } from '../client.js'
import {
  skillCategories,
  skillCategoriesI18n,
  skillItems,
  skillItemsI18n,
  techCategories,
  techCategoriesI18n,
  techItems,
} from '../schema.js'
import type { RepositoryLocale } from './projectsRepository.js'

export interface SkillsResponse {
  techStack: Array<{
    category: string
    items: Array<{
      name: string
      devicon: string
      color: string
    }>
  }>
  categories: Array<{
    category: string
    skills: string[]
  }>
}

export const fetchSkills = async (
  locale: RepositoryLocale
): Promise<SkillsResponse> => {
  const [
    techCategoryRows,
    techCategoryI18nRows,
    techItemRows,
    skillCategoryRows,
    skillCategoryI18nRows,
    skillItemRows,
    skillItemI18nRows,
  ] = await Promise.all([
    db
      .select({
        id: techCategories.id,
        slug: techCategories.slug,
        orderIndex: techCategories.orderIndex,
      })
      .from(techCategories)
      .orderBy(asc(techCategories.orderIndex)),
    db
      .select({
        techCategoryId: techCategoriesI18n.techCategoryId,
        name: techCategoriesI18n.name,
      })
      .from(techCategoriesI18n)
      .where(eq(techCategoriesI18n.locale, locale)),
    db
      .select({
        techCategoryId: techItems.techCategoryId,
        orderIndex: techItems.orderIndex,
        name: techItems.name,
        devicon: techItems.devicon,
        color: techItems.color,
      })
      .from(techItems)
      .orderBy(asc(techItems.orderIndex)),
    db
      .select({
        id: skillCategories.id,
        orderIndex: skillCategories.orderIndex,
      })
      .from(skillCategories)
      .orderBy(asc(skillCategories.orderIndex)),
    db
      .select({
        skillCategoryId: skillCategoriesI18n.skillCategoryId,
        categoryName: skillCategoriesI18n.categoryName,
      })
      .from(skillCategoriesI18n)
      .where(eq(skillCategoriesI18n.locale, locale)),
    db
      .select({
        id: skillItems.id,
        skillCategoryId: skillItems.skillCategoryId,
        orderIndex: skillItems.orderIndex,
      })
      .from(skillItems)
      .orderBy(asc(skillItems.orderIndex)),
    db
      .select({
        skillItemId: skillItemsI18n.skillItemId,
        label: skillItemsI18n.label,
      })
      .from(skillItemsI18n)
      .where(eq(skillItemsI18n.locale, locale)),
  ])

  const techNameById = new Map(
    techCategoryI18nRows.map((row) => [row.techCategoryId, row.name || ''])
  )

  const techItemsByCategoryId = new Map<
    number,
    Array<{ name: string; devicon: string; color: string }>
  >()
  for (const row of techItemRows) {
    if (!techItemsByCategoryId.has(row.techCategoryId)) {
      techItemsByCategoryId.set(row.techCategoryId, [])
    }
    techItemsByCategoryId.get(row.techCategoryId)?.push({
      name: row.name || '',
      devicon: row.devicon || '',
      color: row.color || '#999999',
    })
  }

  const techStack = techCategoryRows.map((row) => ({
    category: techNameById.get(row.id) || row.slug || '',
    items: techItemsByCategoryId.get(row.id) || [],
  }))

  const skillCategoryNameById = new Map(
    skillCategoryI18nRows.map((row) => [row.skillCategoryId, row.categoryName || ''])
  )

  const skillItemLabelById = new Map(
    skillItemI18nRows.map((row) => [row.skillItemId, row.label || ''])
  )

  const skillItemsByCategoryId = new Map<number, string[]>()
  for (const row of skillItemRows) {
    const label = skillItemLabelById.get(row.id)
    if (!label) continue
    if (!skillItemsByCategoryId.has(row.skillCategoryId)) {
      skillItemsByCategoryId.set(row.skillCategoryId, [])
    }
    skillItemsByCategoryId.get(row.skillCategoryId)?.push(label)
  }

  const categories = skillCategoryRows.map((row) => ({
    category: skillCategoryNameById.get(row.id) || `Category ${row.id}`,
    skills: skillItemsByCategoryId.get(row.id) || [],
  }))

  return { techStack, categories }
}
