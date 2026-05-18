import { useState, useCallback } from 'react';
import { Cell, CellMap } from '../types';
import { getCellKey, hasCycle } from '../utils/helpers';
import { parseFormula, evaluateFormula } from '../utils/formula';

export function useSpreadsheet() {
    const [cells, setCells] = useState<CellMap>(new Map());
    const [selectedCell, setSelectedCell] = useState<{
        row: number;
        col: number
    } | null>(null);
    const [selectedRange, setSelectedRange] = useState<{
        start: {
            row: number; col: number
        }; end: { row: number; col: number }
    } |
        null>(null);
    const [rows, setRows] = useState(100);
    const [cols, setCols] = useState(26);

    const updateCell = useCallback((row: number, col: number,
        value: string) => {
        setCells(prev => {
            const newCells = new Map(prev);
            const key = getCellKey(row, col);

            if (!value) {
                newCells.delete(key);
                recalculateDependents(newCells, row, col);
                return newCells;
            }

            let cell: Cell;

            if (value.startsWith('=')) {
                const { dependencies, tokens } = parseFormula(value);

                if (hasCycle(key, dependencies, newCells)) {
                    cell = {
                        value,
                        computed: '#CYCLE!',
                        formula: value,
                        type: 'error',
                        dependencies: []
                    };
                } else {
                    const computed = evaluateFormula(tokens, newCells);
                    cell = {
                        value,
                        computed,
                        formula: value,
                        type: 'formula',
                        dependencies
                    };
                }
            } else if (value.toLowerCase() === 'true' ||
                value.toLowerCase() === 'false') {
                cell = {
                    value,
                    computed: value.toLowerCase() === 'true',
                    type: 'boolean',
                    dependencies: []
                };
            } else {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    cell = {
                        value,
                        computed: num,
                        type: 'number',
                        dependencies: []
                    };
                } else {
                    cell = {
                        value,
                        computed: value,
                        type: 'text',
                        dependencies: []
                    };
                }
            }

            newCells.set(key, cell);
            recalculateDependents(newCells, row, col);

            return newCells;
        });
    }, []);

    const recalculateDependents = (cellMap: CellMap, row: number,
        col: number) => {
        cellMap.forEach((cell, key) => {
            if (cell.type === 'formula' && cell.dependencies) {
                const depends = cell.dependencies.some(dep =>
                    dep.row === row && dep.col === col
                );

                if (depends) {
                    const { tokens } = parseFormula(cell.formula!);
                    const computed = evaluateFormula(tokens, cellMap);
                    cell.computed = computed;
                }
            }
        });
    };

    const getCellValue = useCallback((row: number, col: number):
        Cell | undefined => {
        return cells.get(getCellKey(row, col));
    }, [cells]);

    const insertRow = useCallback((atRow: number) => {
        setCells(prev => {
            const newCells = new Map<string, Cell>();
            prev.forEach((cell, key) => {
                const [r, c] = key.split(',').map(Number);
                if (r >= atRow) {
                    newCells.set(getCellKey(r + 1, c), cell);
                } else {
                    newCells.set(key, cell);
                }
            });
            return newCells;
        });
        setRows(r => r + 1);
    }, []);

    const deleteRow = useCallback((atRow: number) => {
        if (rows <= 1) return;
        setCells(prev => {
            const newCells = new Map<string, Cell>();
            prev.forEach((cell, key) => {
                const [r, c] = key.split(',').map(Number);
                if (r < atRow) {
                    newCells.set(key, cell);
                } else if (r > atRow) {
                    newCells.set(getCellKey(r - 1, c), cell);
                }
            });
            return newCells;
        });
        setRows(r => r - 1);
    }, [rows]);

    const insertColumn = useCallback((atCol: number) => {
        setCells(prev => {
            const newCells = new Map<string, Cell>();
            prev.forEach((cell, key) => {
                const [r, c] = key.split(',').map(Number);
                if (c >= atCol) {
                    newCells.set(getCellKey(r, c + 1), cell);
                } else {
                    newCells.set(key, cell);
                }
            });
            return newCells;
        });
        setCols(c => c + 1);
    }, []);

    const deleteColumn = useCallback((atCol: number) => {
        if (cols <= 1) return;
        setCells(prev => {
            const newCells = new Map<string, Cell>();
            prev.forEach((cell, key) => {
                const [r, c] = key.split(',').map(Number);
                if (c < atCol) {
                    newCells.set(key, cell);
                } else if (c > atCol) {
                    newCells.set(getCellKey(r, c - 1), cell);
                }
            });
            return newCells;
        });
        setCols(c => c - 1);
    }, [cols]);

    return {
        cells,
        selectedCell,
        setSelectedCell,
        selectedRange,
        setSelectedRange,
        updateCell,
        getCellValue,
        rows,
        cols,
        insertRow,
        deleteRow,
        insertColumn,
        deleteColumn
    };
}