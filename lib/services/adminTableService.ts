import { ADMIN_TABLES, getAdminTableConfig } from '../adminTables.js'
import {
  deleteAdminRow,
  insertAdminRow,
  listAdminRows,
  updateAdminRow,
} from '../db/repositories/adminTableRepository.js'
import type { AdminTableConfig } from '../types/admin.js'

export const parseAdminTableLimit = (rawValue: string | undefined) => {
  const parsed = Number.parseInt(rawValue || '', 10)
  if (!Number.isFinite(parsed)) return 200
  return Math.min(Math.max(parsed, 1), 1000)
}

export const normalizeAdminPayload = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export const hasAllPrimaryKeys = (
  config: AdminTableConfig,
  keys: Record<string, unknown>
) => config.primaryKeys.every((key) => keys[key] !== undefined && keys[key] !== null)

export const getAllowedAdminTable = (table: unknown) => {
  if (!table || typeof table !== 'string') return null
  return getAdminTableConfig(table) ? table : null
}

export const getAdminTablesList = () =>
  Object.entries(ADMIN_TABLES).map(([name, config]) => ({
    name,
    label: config.label,
    primaryKeys: config.primaryKeys,
    defaultRow: config.defaultRow || {},
  }))

export const getAdminTableConfigOrNull = (table: string) =>
  getAdminTableConfig(table)

export const getAdminRows = async (table: string, limit: number) =>
  listAdminRows(table, limit)

export const createAdminRow = async (
  table: string,
  row: Record<string, unknown>
) => insertAdminRow(table, row)

export const editAdminRow = async (
  table: string,
  keys: Record<string, unknown>,
  row: Record<string, unknown>
) => updateAdminRow(table, keys, row)

export const removeAdminRow = async (
  table: string,
  keys: Record<string, unknown>
) => {
  await deleteAdminRow(table, keys)
  return { ok: true }
}
