import { describe, test, expect } from 'vitest';
import { where, groupBy, having, sort, query } from './main';

interface Vehicle {
  vin: number;
  brand: string;
  type: string;
  hp: number;
}

const fleet: Vehicle[] = [
  { vin: 101, brand: 'Toyota', type: 'Sedan', hp: 150 },
  { vin: 102, brand: 'BMW', type: 'SUV', hp: 250 },
  { vin: 103, brand: 'Toyota', type: 'SUV', hp: 200 },
  { vin: 104, brand: 'Tesla', type: 'Sedan', hp: 300 },
];

describe('Data Processing Engine (Lab 5 Refactor)', () => {
  
  describe('Basic Transforms', () => {
    test('Filter: should isolate SUV vehicles', () => {
      const getSUVs = where<Vehicle, 'type'>('type', 'SUV');
      const output = getSUVs(fleet);

      expect(output.length).toBe(2);
      expect(output[0].type).toEqual('SUV');
      expect(output[1].type).toEqual('SUV');
    });

    test('Grouping: should bucketize by brand', () => {
      const byBrand = groupBy<Vehicle, 'brand'>('brand');
      const groups = byBrand(fleet);

      const toyota = groups.find(g => g.key === 'Toyota');
      expect(toyota?.items).toContainEqual(fleet[0]);
      expect(toyota?.items).toHaveLength(2);
    });

    test('Validation: should keep groups with more than one unit', () => {
      const rawGroups = groupBy<Vehicle, 'brand'>('brand')(fleet);
      const validator = having<Vehicle, 'brand'>(res => res.items.length > 1);
      const filtered = validator(rawGroups);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].key).not.toBe('BMW');
      expect(filtered[0].key).toBe('Toyota');
    });

    test('Ordering: should arrange by horsepower', () => {
      const byPower = sort<Vehicle, 'hp'>('hp');
      const sorted = byPower(fleet);

      expect(sorted[0].hp).toBe(150);
      expect(sorted[sorted.length - 1].hp).toBe(300);
    });
  });

  describe('Integration (Query Pipe)', () => {
    test('Pipeline execution: chain filter, group and validate', () => {
      const flow = query(
        where<Vehicle, 'type'>('type', 'Sedan'),
        groupBy<Vehicle, 'brand'>('brand'),
        having<Vehicle, 'brand'>(g => g.items.length >= 1),
        sort<any, any>('key')
      );

      const finalData = flow(fleet);

      expect(finalData).toHaveLength(2);
      expect(finalData.map(d => d.key)).toContain('Tesla');
    });

    test('Short pipeline: filtering and sorting only', () => {
      const quickScan = query(
        where<Vehicle, 'brand'>('brand', 'Toyota'),
        sort<Vehicle, 'hp'>('hp')
      );

      const result = quickScan(fleet);
      expect(result[0].hp).toBeLessThan(result[1].hp);
    });
  });

  describe('Metadata Verification', () => {
    test('Check internal stage tags', () => {
      const ops = [
        where<any, any>('a', 'b'),
        groupBy<any, any>('a'),
        having<any, any>(() => true),
        sort<any, any>('a')
      ];

      expect(ops[0].__stage).toBe('where');
      expect(ops[1].__stage).toBe('groupBy');
      expect(ops[2].__stage).toBe('having');
      expect(ops[3].__stage).toBe('sort');
    });
  });
});