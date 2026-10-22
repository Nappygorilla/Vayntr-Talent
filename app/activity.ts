'use client'

/* -------------------------------------------------------------------------- */
/*  Local activity log                                                        */
/*                                                                            */
/*  Reports and feedback used to be discarded: the handler closed the dialog  */
/*  and printed a confirmation. Everything here is written to storage and     */
/*  read straight back, so the interface can only claim a save that happened. */
/*  Nothing leaves the browser until the moderation API exists.               */
/* -------------------------------------------------------------------------- */

export type ReportRecord = {
  id: string
  reason: string
  details: string
  target: string
  reporter: string
  createdAt: string
  status: 'Unreviewed'
}

export type FeedbackRecord = {
  id: string
  topic: string
  details: string
  createdAt: string
}

export const REPORTS_KEY = 'vayntr.reports.v1'
export const FEEDBACK_KEY = 'vayntr.feedback.v1'
const MAX_RECORDS = 100

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function readList<T>(key: string): T[] {
  const store = storage()
  if (!store) return []
  try {
    const parsed = JSON.parse(store.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed as T[] : []
  } catch {
    return []
  }
}

/** Writes the list and confirms it is readable again; false means nothing was stored. */
function writeList<T>(key: string, value: T[]): boolean {
  const store = storage()
  if (!store) return false
  try {
    const serialised = JSON.stringify(value.slice(0, MAX_RECORDS))
    store.setItem(key, serialised)
    return store.getItem(key) === serialised
  } catch {
    return false
  }
}

function newId(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${random.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`
}

/** Stores a report. Returns null when the browser refuses to persist it. */
export function recordReport(input: { reason: string; details: string; target: string; reporter: string }): ReportRecord | null {
  const record: ReportRecord = {
    id: newId('report'),
    reason: input.reason,
    details: input.details.trim().slice(0, 2000),
    target: input.target,
    reporter: input.reporter,
    createdAt: new Date().toISOString(),
    status: 'Unreviewed',
  }
  const next = [record, ...readList<ReportRecord>(REPORTS_KEY)]
  return writeList(REPORTS_KEY, next) ? record : null
}

export function listReports(): ReportRecord[] {
  return readList<ReportRecord>(REPORTS_KEY)
}

/** Stores feedback. Returns null when the browser refuses to persist it. */
export function recordFeedback(input: { topic: string; details: string }): FeedbackRecord | null {
  const record: FeedbackRecord = {
    id: newId('feedback'),
    topic: input.topic,
    details: input.details.trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  }
  const next = [record, ...readList<FeedbackRecord>(FEEDBACK_KEY)]
  return writeList(FEEDBACK_KEY, next) ? record : null
}

export function listFeedback(): FeedbackRecord[] {
  return readList<FeedbackRecord>(FEEDBACK_KEY)
}

export type StoredApplication = {
  listingId: string
  status: string
  shared: string[]
  createdAt: string
}

const APPLICATIONS_KEY = 'vayntr.applications.v1'

/** Applications are kept too, so "application saved" survives a reload. */
export function saveApplication(input: { listingId: string; status: string; shared: string[] }): StoredApplication | null {
  const existing = readList<StoredApplication>(APPLICATIONS_KEY)
  if (existing.some((entry) => entry.listingId === input.listingId)) return null
  const record: StoredApplication = { ...input, shared: [...input.shared], createdAt: new Date().toISOString() }
  return writeList(APPLICATIONS_KEY, [record, ...existing]) ? record : null
}

export function listApplications(): StoredApplication[] {
  return readList<StoredApplication>(APPLICATIONS_KEY)
}

export function setApplicationStatus(listingId: string, status: string): boolean {
  const next = readList<StoredApplication>(APPLICATIONS_KEY).map((entry) => entry.listingId === listingId ? { ...entry, status } : entry)
  return writeList(APPLICATIONS_KEY, next)
}

/** Stable, locale-independent timestamp so server and client never disagree. */
export function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}
