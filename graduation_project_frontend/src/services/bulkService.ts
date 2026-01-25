import api from './api';
import TABLES, { TableKey } from './endpoints';

export interface BulkRequestItem {
  table: string;
  fields?: string[];
}

export async function bulkFetch(requests: BulkRequestItem[]) {
  try {
    const response = await api.post('/bulk-fetch/', { requests });
    console.log('[bulkService] bulkFetch response:', response.status, response.data);
    return response.data;
  } catch (err: any) {
    console.error('[bulkService] bulkFetch error:', err?.response?.status, err?.response?.data ?? err?.message ?? err);
    throw err;
  }
}

// Convenience helpers
export async function fetchTableFields(table: TableKey, fields?: string[]) {
  const req = [{ table: TABLES[table].name, fields: fields ?? TABLES[table].defaultFields }];
  const res = await bulkFetch(req);
  return res?.[TABLES[table].name] ?? [];
}

export async function fetchMultiple(tables: { table: TableKey; fields?: string[] }[]) {
  const req = tables.map(t => ({ table: TABLES[t.table].name, fields: t.fields ?? TABLES[t.table].defaultFields }));
  const res = await bulkFetch(req as BulkRequestItem[]);
  return res;
}

