import {
  fetchAbout,
  type AboutResponse,
} from '../db/repositories/aboutRepository.js'
import {
  fetchExperiences,
  type ExperiencesResponse,
} from '../db/repositories/experiencesRepository.js'
import {
  fetchProfile,
  type ProfileResponse,
} from '../db/repositories/profileRepository.js'
import {
  fetchProjects,
  normalizeRepositoryLocale,
  type ProjectsResponse,
  type RepositoryLocale,
} from '../db/repositories/projectsRepository.js'
import {
  fetchSkills,
  type SkillsResponse,
} from '../db/repositories/skillsRepository.js'

export { normalizeRepositoryLocale }
export type { RepositoryLocale }

export const getAboutContent = async (
  locale: RepositoryLocale
): Promise<AboutResponse> => fetchAbout(locale)

export const getProfileContent = async (
  locale: RepositoryLocale
): Promise<ProfileResponse> => fetchProfile(locale)

export const getProjectsContent = async (
  locale: RepositoryLocale
): Promise<ProjectsResponse> => fetchProjects(locale)

export const getSkillsContent = async (
  locale: RepositoryLocale
): Promise<SkillsResponse> => fetchSkills(locale)

export const getExperiencesContent = async (
  locale: RepositoryLocale
): Promise<ExperiencesResponse> => fetchExperiences(locale)
