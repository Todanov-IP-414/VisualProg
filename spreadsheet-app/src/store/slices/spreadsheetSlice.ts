import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cell, CellMap } from '../../types';
import { getCellKey, hasCycle } from '../../utils/helpers';
import { evaluateFormula, parseFormula } from '../../utils/formula';

interface Position {
    row: number;
    col: number;
}

interface Range {
    start: Position;
    end: Position;
}

interface SpreadsheetState {
    cells: Record<string, Cell>;
    selectedCell: Position | null;
    selectedRange: Range | null;
    rows: number;
    cols: number;
    history: Record<string, Cell>[];
    historyIndex: number;
}

const initialState: SpreadsheetState = {
    cells: {},
    selectedCell: null,
    selectedRange: null,
    rows: 1000,
    cols: 26,
    history: [],
    historyIndex: -1
};

const recalculateDependents = (cells: Record<string, Cell>, row: number, col: number) => {
    Object.entries(cells).forEach(([key, cell]) => {
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
        const cellMap = new Map(Object.entries(cells));
        cell.computed = evaluateFormula(parsed.tokens, cellMap);
    });
};

const spreadsheetSlice = createSlice({
    name: 'spreadsheet',
    initialState,
    reducers: {
        updateCell: (state, action: PayloadAction<{ row: number; col: number; value: string }>) => {
            const { row, col, value } = action.payload;
            const key = getCellKey(row, col);

            if (state.history.length === 0 || state.historyIndex === -1) {
                state.history.push({ ...state.cells });
                state.historyIndex = 0;
            }

            if (state.historyIndex < state.history.length - 1) {
                state.history = state.history.slice(0, state.historyIndex + 1);
            }

            if (value.trim() === '') {
                delete state.cells[key];
                recalculateDependents(state.cells, row, col);
            } else {
                let cell: Cell;

                if (value.startsWith('=')) {
                    const parsed = parseFormula(value);
                    const cellMap = new Map(Object.entries(state.cells));

                    if (hasCycle(key, parsed.dependencies, cellMap)) {
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
                            computed: evaluateFormula(parsed.tokens, cellMap),
                            formula: value,
                            type: 'formula',
                            dependencies: parsed.dependencies
                        };
                    }
                } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
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

                state.cells[key] = cell;
                recalculateDependents(state.cells, row, col);
            }

            state.history.push({ ...state.cells });
            state.historyIndex++;

            if (state.history.length > 50) {
                state.history.shift();
                state.historyIndex--;
            }
        },

        undo: (state) => {
            if (state.historyIndex > 0) {
                state.historyIndex--;
                state.cells = { ...state.history[state.historyIndex] };
            }
        },

        redo: (state) => {
            if (state.historyIndex < state.history.length - 1) {
                state.historyIndex++;
                state.cells = { ...state.history[state.historyIndex] };
            }
        },

        setSelectedCell: (state, action: PayloadAction<Position | null>) => {
            state.selectedCell = action.payload;
        },

        setSelectedRange: (state, action: PayloadAction<Range | null>) => {
            state.selectedRange = action.payload;
        },

        insertRow: (state, action: PayloadAction<number>) => {
            const atRow = action.payload;
            const newCells: Record<string, Cell> = {};

            Object.entries(state.cells).forEach(([key, cell]) => {
                const [r, c] = key.split(',').map(Number);
                if (r >= atRow) {
                    newCells[getCellKey(r + 1, c)] = cell;
                } else {
                    newCells[key] = cell;
                }
            });

            state.cells = newCells;
            state.rows++;
        },

        deleteRow: (state, action: PayloadAction<number>) => {
            if (state.rows <= 1) return;

            const atRow = action.payload;
            const newCells: Record<string, Cell> = {};

            Object.entries(state.cells).forEach(([key, cell]) => {
                const [r, c] = key.split(',').map(Number);
                if (r < atRow) {
                    newCells[key] = cell;
                } else if (r > atRow) {
                    newCells[getCellKey(r - 1, c)] = cell;
                }
            });

            state.cells = newCells;
            state.rows--;
        },

        insertColumn: (state, action: PayloadAction<number>) => {
            const atCol = action.payload;
            const newCells: Record<string, Cell> = {};

            Object.entries(state.cells).forEach(([key, cell]) => {
                const [r, c] = key.split(',').map(Number);
                if (c >= atCol) {
                    newCells[getCellKey(r, c + 1)] = cell;
                } else {
                    newCells[key] = cell;
                }
            });

            state.cells = newCells;
            state.cols++;
        },

        deleteColumn: (state, action: PayloadAction<number>) => {
            if (state.cols <= 1) return;

            const atCol = action.payload;
            const newCells: Record<string, Cell> = {};

            Object.entries(state.cells).forEach(([key, cell]) => {
                const [r, c] = key.split(',').map(Number);
                if (c < atCol) {
                    newCells[key] = cell;
                } else if (c > atCol) {
                    newCells[getCellKey(r, c - 1)] = cell;
                }
            });

            state.cells = newCells;
            state.cols--;
        },

        loadState: (state, action: PayloadAction<{ cells: Record<string, Cell>; rows: number; cols: number }>) => {
            state.cells = action.payload.cells;
            state.rows = action.payload.rows;
            state.cols = action.payload.cols;
            state.selectedCell = null;
            state.selectedRange = null;
            state.history = [];
            state.historyIndex = -1;
        }
    }
});

export const {
    updateCell,
    undo,
    redo,
    setSelectedCell,
    setSelectedRange,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    loadState
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;
