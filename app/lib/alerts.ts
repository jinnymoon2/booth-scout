// @ts-nocheck
import type { EventFilters, SavedFilter } from "./types";

const memoryStore: SavedFilter[] = [];

function makeId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createSavedFilter(
  email: string | null,
  filters: EventFilters,
  name: string | null = null
): Promise<SavedFilter> {
  const savedFilter: SavedFilter = {
    id: makeId(),
    email,
    name,
    filters,
    createdAt: new Date().toISOString(),
    active: true,
    lastSentAt: null,
  };

  memoryStore.unshift(savedFilter);

  return savedFilter;
}

export async function getSavedFilters(): Promise<SavedFilter[]> {
  return memoryStore;
}

export async function listSavedFilters(): Promise<SavedFilter[]> {
  return getSavedFilters();
}

export async function deleteSavedFilter(id: string): Promise<boolean> {
  const index = memoryStore.findIndex((filter) => filter.id === id);

  if (index === -1) {
    return false;
  }

  memoryStore.splice(index, 1);
  return true;
}

export async function removeSavedFilter(id: string): Promise<boolean> {
  return deleteSavedFilter(id);
}

export async function sendAlertsForSavedFilters() {
  return {
    ok: true,
    sent: 0,
    message: "Email alerts have been removed from BoothScout.",
  };
}

export async function sendAlerts() {
  return sendAlertsForSavedFilters();
}
