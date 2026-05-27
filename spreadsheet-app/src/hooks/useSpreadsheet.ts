import { useCallback, useState } from 'react';

import { Cell, CellMap } from '../types';
import { hasCycle, getCellKey } from '../utils/helpers';
import { evaluateFormula, parseFormula } from '../utils/formula';

type Position = {
    row: number;
    col: number;
};

type Range = {
    start: Position;
    end: Position;
};

export function useSpreadsheet() {
    const [cells, setCells] = useState<CellMap>(new Map());

    const [selectedCell, setSelectedCell] = useState<Position | null>(null);

    const [selectedRange, setSelectedRange] = useState<Range | null>(null);

    const [rows, setRows] = useState<number>(1000);
    const [cols, setCols] = useState<number>(26);

    const recalculateDependents = useCallback(
        (cellMap: CellMap, row: number, col: number) => {
            cellMap.forEach(cell => {
                if (cell.type !== 'formula' || !cell.dependencies) {
                    return;
                }

                const dependsOnCell = cell.dependencies.some(
                    dep => dep.row === row && dep.col === col
                );

                if (!dependsOnCell || !cell.formula) {
                    return;
                }

                const parsed = parseFormula(cell.formula);

                cell.computed = evaluateFormula(parsed.tokens, cellMap);
            });
        },
        []
    );

    const updateCell = useCallback(
        (row: number, col: number, value: string) => {
            setCells(prev => {
                const newCells = new Map(prev);

                const key = getCellKey(row, col);

                if (value.trim() === '') {
                    newCells.delete(key);

                    recalculateDependents(newCells, row, col);

                    return newCells;
                }

                let cell: Cell;

                if (value.startsWith('=')) {
                    const parsed = parseFormula(value);

                    if (hasCycle(key, parsed.dependencies, newCells)) {
                        cell = {
                            value,
                            computed: '#CYCLE!',
                            formula: value,
                            type: 'error',
                            dependencies: []
                        };
                    } else {
                        cell = {
                            value,
                            computed: evaluateFormula(
                                parsed.tokens,
                                newCells
                            ),
                            formula: value,
                            type: 'formula',
                            dependencies: parsed.dependencies
                        };
                    }
                } else if (
                    value.toLowerCase() === 'true' ||
                    value.toLowerCase() === 'false'
                ) {
                    cell = {
                        value,
                        computed: value.toLowerCase() === 'true',
                        type: 'boolean',
                        dependencies: []
                    };
                } else {
                    const parsedNumber = Number(value);

                    if (!Number.isNaN(parsedNumber)) {
                        cell = {
                            value,
                            computed: parsedNumber,
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
        },
        [recalculateDependents]
    );

    const getCellValue = useCallback(
        (row: number, col: number): Cell | undefined => {
            return cells.get(getCellKey(row, col));
        },
        [cells]
    );

    const insertRow = useCallback((atRow: number) => {
        setCells(prev => {
            const newCells: CellMap = new Map();

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

        setRows(prev => prev + 1);
    }, []);

    const deleteRow = useCallback(
        (atRow: number) => {
            if (rows <= 1) {
                return;
            }

            setCells(prev => {
                const newCells: CellMap = new Map();

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

            setRows(prev => prev - 1);
        },
        [rows]
    );

    const insertColumn = useCallback((atCol: number) => {
        setCells(prev => {
            const newCells: CellMap = new Map();

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

        setCols(prev => prev + 1);
    }, []);

    const deleteColumn = useCallback(
        (atCol: number) => {
            if (cols <= 1) {
                return;
            }

            setCells(prev => {
                const newCells: CellMap = new Map();

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

            setCols(prev => prev - 1);
        },
        [cols]
    );

    const loadState = useCallback(
        (newCells: CellMap, newRows: number, newCols: number) => {
            setCells(newCells);

            setRows(newRows);

            setCols(newCols);

            setSelectedCell(null);

            setSelectedRange(null);
        },
        []
    );

    const getState = useCallback(() => {
        return {
            cells,
            rows,
            cols
        };
    }, [cells, rows, cols]);

    return {
        cells,

        selectedCell,
        setSelectedCell,

        selectedRange,
        setSelectedRange,

        rows,
        cols,

        updateCell,
        getCellValue,

        insertRow,
        deleteRow,

        insertColumn,
        deleteColumn,

        loadState,
        getState
    };
}