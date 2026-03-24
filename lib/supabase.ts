// Blink DB adapter — same interface as the old Supabase client
// so existing hooks work without changes.
import { blink } from './blink';

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id?: string;
  userId?: string;
  user_id?: string; // kept for insert compat
  displayName?: string | null;
  display_name?: string | null;
  city: string;
  language: string;
  calculationMethod?: string;
  calculation_method?: string; // kept for insert compat
  prayerAlerts?: number;
  prayer_alerts?: number;
  adhkarReminders?: number;
  adhkar_reminders?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface PrayerLog {
  id?: string;
  user_id: string;
  prayer_name: string;
  date: string;
  status: 'completed' | 'missed';
  created_at?: string;
}

export interface AdhkarProgress {
  id?: string;
  user_id: string;
  dhikr_id: string;
  date: string;
  count: number;
  completed: boolean;
  created_at?: string;
}

export interface ScanHistory {
  id?: string;
  user_id: string;
  image_url?: string;
  product_name?: string;
  result: string;
  ingredients?: string;
  reason?: string;
  confidence?: number;
  created_at?: string;
}

export interface FastingLog {
  id?: string;
  user_id: string;
  date: string;
  fasted: boolean;
  created_at?: string;
}

// ── Query builder ────────────────────────────────────────────────────────────

function makeSelectBuilder(tableName: string) {
  const state = {
    _filters: [] as Array<[string, any]>,
    _single: false,
    _limit: undefined as number | undefined,
    _orderCol: undefined as string | undefined,
    _orderAsc: true,
  };

  const builder: any = {
    eq(col: string, val: any) {
      state._filters.push([col, val]);
      return builder;
    },
    order(col: string, opts?: { ascending?: boolean }) {
      state._orderCol = col;
      state._orderAsc = opts?.ascending !== false;
      return builder;
    },
    limit(n: number) {
      state._limit = n;
      return builder;
    },
    single() {
      state._single = true;
      return builder;
    },
    async then(resolve: (v: any) => any, reject?: (e: any) => any) {
      try {
        const where: Record<string, any> = {};
        for (const [k, v] of state._filters) where[k] = v;

        const orderBy = state._orderCol
          ? { [state._orderCol]: state._orderAsc ? 'asc' : 'desc' }
          : undefined;

        let rows = await blink.db[tableName].list({
          where: Object.keys(where).length ? where : undefined,
          orderBy,
          limit: state._limit,
        } as any);

        if (state._single) {
          const row = rows?.[0] ?? null;
          const error = row === null ? { code: 'PGRST116', message: 'No rows' } : null;
          return resolve({ data: row, error });
        }
        return resolve({ data: rows ?? [], error: null });
      } catch (e: any) {
        return reject ? reject(e) : resolve({ data: null, error: e });
      }
    },
  };

  return builder;
}

function makeInsertBuilder(tableName: string, payload: Record<string, any> | Record<string, any>[]) {
  const state = { _selectAfter: false, _single: false };

  const builder: any = {
    select() { state._selectAfter = true; return builder; },
    single() { state._single = true; return builder; },
    async then(resolve: (v: any) => any, reject?: (e: any) => any) {
      try {
        const items = Array.isArray(payload) ? payload : [payload];
        const created = await Promise.all(
          items.map((item) => blink.db[tableName].create(item))
        );
        if (state._selectAfter) {
          const result = state._single ? (created[0] ?? null) : created;
          return resolve({ data: result, error: null });
        }
        return resolve({ data: null, error: null });
      } catch (e: any) {
        return reject ? reject(e) : resolve({ data: null, error: e });
      }
    },
  };

  return builder;
}

function makeUpdateBuilder(tableName: string, payload: Record<string, any>) {
  const state = { _filters: [] as Array<[string, any]>, _single: false };

  const builder: any = {
    eq(col: string, val: any) {
      state._filters.push([col, val]);
      return builder;
    },
    select() { return builder; },
    single() { state._single = true; return builder; },
    async then(resolve: (v: any) => any, reject?: (e: any) => any) {
      try {
        const where: Record<string, any> = {};
        for (const [k, v] of state._filters) where[k] = v;

        const rows = await blink.db[tableName].list({ where } as any);
        if (!rows || rows.length === 0) {
          return resolve({ data: null, error: { message: 'Not found' } });
        }
        const updated = await Promise.all(
          rows.map((r: any) => blink.db[tableName].update(r.id, payload))
        );
        const result = state._single ? (updated[0] ?? null) : updated;
        return resolve({ data: result, error: null });
      } catch (e: any) {
        return reject ? reject(e) : resolve({ data: null, error: e });
      }
    },
  };

  return builder;
}

function makeDeleteBuilder(tableName: string) {
  const state = { _filters: [] as Array<[string, any]> };

  const builder: any = {
    eq(col: string, val: any) {
      state._filters.push([col, val]);
      return builder;
    },
    async then(resolve: (v: any) => any, reject?: (e: any) => any) {
      try {
        const where: Record<string, any> = {};
        for (const [k, v] of state._filters) where[k] = v;

        const rows = await blink.db[tableName].list({ where } as any);
        if (rows && rows.length > 0) {
          await Promise.all(rows.map((r: any) => blink.db[tableName].delete(r.id)));
        }
        return resolve({ data: null, error: null });
      } catch (e: any) {
        return reject ? reject(e) : resolve({ data: null, error: e });
      }
    },
  };

  return builder;
}

function makeCountBuilder(tableName: string) {
  const state = { _filters: [] as Array<[string, any]> };

  const builder: any = {
    eq(col: string, val: any) {
      state._filters.push([col, val]);
      return builder;
    },
    async then(resolve: (v: any) => any, reject?: (e: any) => any) {
      try {
        const where: Record<string, any> = {};
        for (const [k, v] of state._filters) where[k] = v;

        const rows = await blink.db[tableName].list({
          where: Object.keys(where).length ? where : undefined,
        } as any);

        return resolve({ count: (rows ?? []).length, error: null });
      } catch (e: any) {
        return reject ? reject(e) : resolve({ count: 0, error: e });
      }
    },
  };

  return builder;
}

// ── Supabase-compatible client shim ──────────────────────────────────────────

export const supabase = {
  from: (tableName: string) => ({
    select: (_cols = '*', opts?: { count?: string; head?: boolean }) => {
      if (opts?.count === 'exact') {
        // Count query — return a special builder
        return makeCountBuilder(tableName);
      }
      return makeSelectBuilder(tableName);
    },
    insert: (payload: Record<string, any> | Record<string, any>[]) =>
      makeInsertBuilder(tableName, payload),
    update: (payload: Record<string, any>) =>
      makeUpdateBuilder(tableName, payload),
    delete: () => makeDeleteBuilder(tableName),
  }),
};
