type Stage = 'where' | 'groupBy' | 'having' | 'sort';

type NextValidStage<S extends Stage> = 
  S extends 'where'   ? 'where' | 'groupBy' | 'having' | 'sort' :
  S extends 'groupBy' ? 'groupBy' | 'having' | 'sort' :
  S extends 'having'  ? 'having' | 'sort' :
  S extends 'sort'    ? 'sort' : 
  never;

export type Transform<In, Out = In, S extends Stage = Stage> = {
  (data: In[]): Out[];
  __stage: S;
};

export type Where = <T, K extends keyof T>(key: K, value: T[K]) => Transform<T, T, 'where'>;
export type Sort = <T, K extends keyof T>(key: K) => Transform<T, T, 'sort'>;

export type Group<T, K extends keyof T> = { key: T[K]; items: T[]; };
export type GroupBy = <T, K extends keyof T>(key: K) => Transform<T, Group<T, K>, 'groupBy'>;
export type Having = <T, K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => Transform<Group<T, K>, Group<T, K>, 'having'>;

const createTransform = <In, Out, S extends Stage>(fn: (data: In[]) => Out[], stage: S): Transform<In, Out, S> => {
  return Object.assign(fn, { __stage: stage });
};

export const where: Where = (key, value) => 
  createTransform((data) => data.filter((item) => item[key] === value), 'where');

export const sort: Sort = (key) => 
  createTransform((data) => [...data].sort((a, b) => (a[key] < b[key] ? -1 : 1)), 'sort');

export const groupBy: GroupBy = <T, K extends keyof T>(key: K) => 
  createTransform((data: T[]) => {
    const grouped = data.reduce((acc, item) => {
      const k = item[key] as unknown as string;
      if (!acc[k]) acc[k] = { key: item[key], items: [] };
      acc[k].items.push(item);
      return acc;
    }, {} as Record<string, Group<T, K>>);
    return Object.values(grouped);
  }, 'groupBy');

export const having: Having = (predicate) => 
  createTransform((groups) => groups.filter(predicate), 'having');

type ValidatePipeline<Fns extends any[], LastStage extends Stage = 'where'> = 
  Fns extends [infer Head, ...infer Tail]
    ? Head extends { __stage: infer CurrentStage extends Stage }
      ? CurrentStage extends NextValidStage<LastStage>
        ? [Head, ...ValidatePipeline<Tail, CurrentStage>]
        : ["Неверный порядок!", CurrentStage, "не может идти после", LastStage]
      : [Head, ...ValidatePipeline<Tail, LastStage>]
    : Fns;

export function query<
  Args extends any[],
  ValidArgs extends any[] = ValidatePipeline<Args>
>(...fns: Args & ValidArgs): (data: any[]) => any[] {
  return (data: any[]) => fns.reduce((acc, fn) => fn(acc), data);
}