export type Transform<In, Out = In> = (data: In[]) => Out[];

export type Where = <T, K extends keyof T>(
  key: K,
  value: T[K]
) => Transform<T, T>;

export type Sort = <T, K extends keyof T>(
  key: K
) => Transform<T, T>;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy = <T, K extends keyof T>(
  key: K
) => Transform<T, Group<T, K>>;

export type Having = <T, K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean
) => Transform<Group<T, K>, Group<T, K>>;

export const where: Where = (key, value) => (data) =>
  data.filter((item) => item[key] === value);

export const sort: Sort = (key) => (data) =>
  [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });

export const groupBy: GroupBy = (key) => (data) => {
  const grouped = data.reduce((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) {
      acc[k] = { key: item[key], items: [] };
    }
    acc[k].items.push(item);
    return acc;
  }, {} as Record<string, Group<any, any>>);
  
  return Object.values(grouped);
};

export const having: Having = (predicate) => (groups) =>
  groups.filter(predicate);

export function query<A, B>(
  f1: Transform<A, B>
): Transform<A, B>;
export function query<A, B, C>(
  f1: Transform<A, B>,
  f2: Transform<B, C>
): Transform<A, C>;
export function query<A, B, C, D>(
  f1: Transform<A, B>,
  f2: Transform<B, C>,
  f3: Transform<C, D>
): Transform<A, D>;
export function query<A, B, C, D, E>(
  f1: Transform<A, B>,
  f2: Transform<B, C>,
  f3: Transform<C, D>,
  f4: Transform<D, E>
): Transform<A, E>;
export function query<A, B, C, D, E, F>(
  f1: Transform<A, B>,
  f2: Transform<B, C>,
  f3: Transform<C, D>,
  f4: Transform<D, E>,
  f5: Transform<E, F>
): Transform<A, F>;
export function query(...fns: Array<Transform<any, any>>): Transform<any, any> {
  return (data: any[]) => fns.reduce((acc, fn) => fn(acc), data);
}