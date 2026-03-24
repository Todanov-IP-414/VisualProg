import { describe, it, expect } from 'vitest';
import { where, groupBy, having, sort, query } from './main';

interface People {
  id: number;
  name: string;
  category: string;
  age: number;
}

const Peoples: People[] = [
  { id: 1, name: 'Dmitry', category: 'IT', age: 20 },
  { id: 2, name: 'Andrey', category: 'IT', age: 25 },
  { id: 3, name: 'Alexandr', category: 'Web', age: 27 },
  { id: 4, name: 'Artem', category: 'IT', age: 20 },
];

describe('Query Pipeline System', () => {
  
  describe('Individual Operators', () => {
    it('where: should filter data by key-value pair', () => {
      const filterIT = where<People, 'category'>('category', 'IT');
      const result = filterIT(Peoples);
      expect(result).toHaveLength(3);
      expect(result.every(i => i.category === 'IT')).toBe(true);
    });

    it('groupBy: should group items by key', () => {
      const groupByCategory = groupBy<People, 'category'>('category');
      const result = groupByCategory(Peoples);
      
      expect(result).toHaveLength(2);
      const ITGroup = result.find(g => g.key === 'IT');
      expect(ITGroup?.items).toHaveLength(3);
    });

    it('having: should filter groups by predicate', () => {
      const groups = groupBy<People, 'category'>('category')(Peoples);
      const filterGroups = having<People, 'category'>((g) => g.items.length > 1);
      const result = filterGroups(groups);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('IT');
    });

    it('sort: should sort items ascending', () => {
      const sortByage = sort<People, 'age'>('age');
      const result = sortByage(Peoples);
      expect(result[0].age).toBe(20);
      expect(result[3].age).toBe(27);
    });
  });

  describe('query() Functionality', () => {
    it('should execute a full pipeline correctly', () => {
      const fullQuery = query(
        where<People, 'category'>('category', 'IT'),
        groupBy<People, 'category'>('category'),
        having<People, 'category'>(g => g.items.length > 1),
        sort<any, any>('key')
      );

      const result = fullQuery(Peoples);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('IT');
      expect(result[0].items).toHaveLength(3);
    });

    it('should work with partial pipelines (e.g., where + sort)', () => {
      const simpleQuery = query(
        where<People, 'category'>('category', 'IT'),
        sort<People, 'age'>('age')
      );

      const result = simpleQuery(Peoples);
      expect(result).toHaveLength(3);
      expect(result[0].age).toBe(20);
      expect(result[2].age).toBe(25);
    });
  });

  describe('Type Integrity (Logic Check)', () => {
    it('each operator should have the correct __stage brand', () => {
    expect(where<Record<string, any>, string>('id', 1).__stage).toBe('where');
    expect(groupBy<Record<string, any>, string>('category').__stage).toBe('groupBy');
    expect(having<any, any>(() => true).__stage).toBe('having');
    expect(sort<Record<string, any>, string>('id').__stage).toBe('sort');
    });
  });
});