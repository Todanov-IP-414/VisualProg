import { describe, it, expect } from 'vitest';
import spreadsheetReducer, {
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
} from '../spreadsheetSlice';

describe('spreadsheetSlice', () => {
    const initialState = {
        cells: {},
        selectedCell: null,
        selectedRange: null,
        rows: 1000,
        cols: 26,
        history: [],
        historyIndex: -1
    };

    it('должен вернуть начальное состояние', () => {
        expect(spreadsheetReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('должен обновить ячейку с числовым значением', () => {
        const state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: '42' }));

        expect(state.cells['0,0']).toEqual({
            value: '42',
            computed: 42,
            type: 'number',
            dependencies: []
        });
        expect(state.history.length).toBe(2);
        expect(state.historyIndex).toBe(1);
    });

    it('должен обновить ячейку с текстовым значением', () => {
        const state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'hello' }));

        expect(state.cells['0,0']).toEqual({
            value: 'hello',
            computed: 'hello',
            type: 'text',
            dependencies: []
        });
    });

    it('должен обновить ячейку с булевым значением', () => {
        const state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'true' }));

        expect(state.cells['0,0']).toEqual({
            value: 'true',
            computed: true,
            type: 'boolean',
            dependencies: []
        });
    });

    it('должен удалить ячейку при пустом значении', () => {
        let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: '42' }));
        state = spreadsheetReducer(state, updateCell({ row: 0, col: 0, value: '' }));

        expect(state.cells['0,0']).toBeUndefined();
    });

    it('должен выполнить undo', () => {
        let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: '42' }));
        state = spreadsheetReducer(state, updateCell({ row: 0, col: 0, value: '100' }));
        state = spreadsheetReducer(state, undo());

        expect(state.cells['0,0']).toEqual({
            value: '42',
            computed: 42,
            type: 'number',
            dependencies: []
        });
        expect(state.historyIndex).toBe(1);
    });

    it('должен выполнить redo', () => {
        let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: '42' }));
        state = spreadsheetReducer(state, updateCell({ row: 0, col: 0, value: '100' }));
        state = spreadsheetReducer(state, undo());
        state = spreadsheetReducer(state, redo());

        expect(state.cells['0,0']).toEqual({
            value: '100',
            computed: 100,
            type: 'number',
            dependencies: []
        });
        expect(state.historyIndex).toBe(2);
    });

    it('не должен выполнить undo если история пуста', () => {
        const state = spreadsheetReducer(initialState, undo());

        expect(state.historyIndex).toBe(-1);
        expect(state.cells).toEqual({});
    });

    it('не должен выполнить redo если нет следующего состояния', () => {
        let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: '42' }));
        state = spreadsheetReducer(state, redo());

        expect(state.historyIndex).toBe(1);
    });

    it('должен установить выбранную ячейку', () => {
        const state = spreadsheetReducer(initialState, setSelectedCell({ row: 5, col: 3 }));

        expect(state.selectedCell).toEqual({ row: 5, col: 3 });
    });

    it('должен установить выбранный диапазон', () => {
        const range = {
            start: { row: 0, col: 0 },
            end: { row: 5, col: 5 }
        };
        const state = spreadsheetReducer(initialState, setSelectedRange(range));

        expect(state.selectedRange).toEqual(range);
    });

    it('должен вставить строку', () => {
        let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'A' }));
        state = spreadsheetReducer(state, updateCell({ row: 1, col: 0, value: 'B' }));
        state = spreadsheetReducer(state, insertRow(1));

        expect(state.cells['0,0'].value).toBe('A');
        expect(state.cells['2,0'].value).toBe('B');
        expect(state.cells['1,0']).toBeUndefined();
        expect(state.rows).toBe(1001);
    });

    it('должен удалить строку', () => {
        let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'A' }));
        state = spreadsheetReducer(state, updateCell({ row: 1, col: 0, value: 'B' }));
        state = spreadsheetReducer(state, updateCell({ row: 2, col: 0, value: 'C' }));
        state = spreadsheetReducer(state, deleteRow(1));

        expect(state.cells['0,0'].value).toBe('A');
        expect(state.cells['1,0'].value).toBe('C');
        expect(state.cells['2,0']).toBeUndefined();
        expect(state.rows).toBe(999);
    });

    it('не должен удалить строку если осталась только одна', () => {
        const state = {
            cells: {},
            selectedCell: null,
            selectedRange: null,
            rows: 1,
            cols: 26,
            history: [],
            historyIndex: -1
        };
        const newState = spreadsheetReducer(state, deleteRow(0));

        expect(newState.rows).toBe(1);
    });

    it('должен вставить столбец', () => {
        let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'A' }));
        state = spreadsheetReducer(state, updateCell({ row: 0, col: 1, value: 'B' }));
        state = spreadsheetReducer(state, insertColumn(1));

        expect(state.cells['0,0'].value).toBe('A');
        expect(state.cells['0,2'].value).toBe('B');
        expect(state.cells['0,1']).toBeUndefined();
        expect(state.cols).toBe(27);
    });

    it('должен удалить столбец', () => {
        let state = spreadsheetReducer(initialState, updateCell({ row: 0, col: 0, value: 'A' }));
        state = spreadsheetReducer(state, updateCell({ row: 0, col: 1, value: 'B' }));
        state = spreadsheetReducer(state, updateCell({ row: 0, col: 2, value: 'C' }));
        state = spreadsheetReducer(state, deleteColumn(1));

        expect(state.cells['0,0'].value).toBe('A');
        expect(state.cells['0,1'].value).toBe('C');
        expect(state.cells['0,2']).toBeUndefined();
        expect(state.cols).toBe(25);
    });

    it('не должен удалить столбец если остался только один', () => {
        const state = {
            cells: {},
            selectedCell: null,
            selectedRange: null,
            rows: 1000,
            cols: 1,
            history: [],
            historyIndex: -1
        };
        const newState = spreadsheetReducer(state, deleteColumn(0));

        expect(newState.cols).toBe(1);
    });

    it('должен загрузить состояние', () => {
        const newCells = {
            '0,0': {
                value: '42',
                computed: 42,
                type: 'number' as const,
                dependencies: []
            }
        };

        const state = spreadsheetReducer(initialState, loadState({
            cells: newCells,
            rows: 500,
            cols: 10
        }));

        expect(state.cells).toEqual(newCells);
        expect(state.rows).toBe(500);
        expect(state.cols).toBe(10);
        expect(state.selectedCell).toBeNull();
        expect(state.selectedRange).toBeNull();
        expect(state.history).toEqual([]);
        expect(state.historyIndex).toBe(-1);
    });
});
