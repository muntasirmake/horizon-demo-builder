import type { EntryPointType } from './types';

export function getLockedHeight(type: EntryPointType, imgW: number): number {
  const ref = type === 'circle-row' ? 240 : 550;
  return Math.round(ref * (imgW / 1920));
}

export function getTypeName(type: EntryPointType): string {
  return type === 'circle-row' ? 'Circle Row' : 'Rectangle Row';
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function normalizeSlug(raw: string): string {
  return (raw || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/, '');
}
