import { useState } from 'react';
import type { MouseEvent } from 'react';

import { ContextMenuState } from '../types';
import { Cell } from './Cell';
import { ContextMenu } from './ContextMenu';
import { addressToString, getCellKey } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import {
    updateCell,
    setSelectedCell,
    setSelectedRange,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn
} from '../store/slices/spreadsheetSlice';

const MIN_COL_WIDTH = 50;
const MIN_ROW_HEIGHT = 20;

type Position = {
    row: number;
    col: number;
};

type Range = {
    start: Position;
    end: Position;
};

export function Spreadsheet() {
    const dispatch = useAppDispatch();
    const { cells, selectedCell, selectedRange, rows, cols } = useAppSelector(state => state.spreadsheet);

    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        row: 0,
        col: 0
    });

    const [columnWidths, setColumnWidths] = useState<number[]>(() =>
        Array(cols).fill(100)
    );

    const [rowHeights, setRowHeights] = useState<number[]>(() =>
        Array(rows).fill(30)
    );

    const [resizing, setResizing] = useState<{
        type: 'col' | 'row';
        index: number;
    } | null>(null);

    const getColumnLabel = (col: number): string => {
        let label = '';
        let current = col;

        while (current >= 0) {
            label = String.fromCharCode(65 + (current % 26)) + label;
            current = Math.floor(current / 26) - 1;
        }

        return label;
    };

    const handleCellSelect = (row: number, col: number, shiftKey: boolean) => {
        if (shiftKey && selectedCell) {
            dispatch(setSelectedRange({
                start: selectedCell,
                end: { row, col }
            }));
            return;
        }

        dispatch(setSelectedCell({ row, col }));
        dispatch(setSelectedRange(null));
    };

    const isCellInRange = (row: number, col: number): boolean => {
        if (!selectedRange) {
            return false;
        }

        const { start, end } = selectedRange;

        return (
            row >= Math.min(start.row, end.row) &&
            row <= Math.max(start.row, end.row) &&
            col >= Math.min(start.col, end.col) &&
            col <= Math.max(start.col, end.col)
        );
    };

    const handleContextMenu = (e: MouseEvent, row: number, col: number) => {
        e.preventDefault();

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            row,
            col
        });
    };

    const handleMouseDown = (type: 'col' | 'row', index: number) => {
        setResizing({ type, index });
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!resizing) {
            return;
        }

        if (resizing.type === 'col') {
            setColumnWidths(prev => {
                const next = [...prev];
                next[resizing.index] = Math.max(
                    MIN_COL_WIDTH,
                    (next[resizing.index] ?? 100) + e.movementX
                );
                return next;
            });
            return;
        }

        setRowHeights(prev => {
            const next = [...prev];
            next[resizing.index] = Math.max(
                MIN_ROW_HEIGHT,
                (next[resizing.index] ?? 30) + e.movementY
            );
            return next;
        });
    };

    const handleMouseUp = () => {
        setResizing(null);
    };

    const getCellValue = (row: number, col: number) => {
        return cells[getCellKey(row, col)];
    };

    const selectedCellData = selectedCell ? getCellValue(selectedCell.row, selectedCell.col) : undefined;

    return (
        <div
            style={{ padding: '20px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>
                        {selectedCell ? addressToString(selectedCell) : ''}
                    </span>

                    <input
                        type="text"
                        value={selectedCellData?.value ?? ''}
                        placeholder="Введите значение или формулу"
                        onChange={e => {
                            if (!selectedCell) {
                                return;
                            }

                            dispatch(updateCell({
                                row: selectedCell.row,
                                col: selectedCell.col,
                                value: e.target.value
                            }));
                        }}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                </div>
            </div>

            <div style={{ overflow: 'auto', maxHeight: '600px', border: '1px solid #ccc' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th
                                style={{
                                    border: '1px solid #ddd',
                                    background: '#f5f5f5',
                                    minWidth: '40px',
                                    position: 'sticky',
                                    top: 0,
                                    left: 0,
                                    zIndex: 3
                                }}
                            />

                            {Array.from({ length: cols }, (_, col) => (
                                <th
                                    key={col}
                                    onContextMenu={e => handleContextMenu(e, -1, col)}
                                    style={{
                                        border: '1px solid #ddd',
                                        background: '#f5f5f5',
                                        width: columnWidths[col] ?? 100,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        {getColumnLabel(col)}

                                        <div
                                            onMouseDown={() => handleMouseDown('col', col)}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                bottom: 0,
                                                width: '5px',
                                                cursor: 'col-resize'
                                            }}
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({ length: rows }, (_, row) => (
                            <tr key={row}>
                                <td
                                    onContextMenu={e => handleContextMenu(e, row, -1)}
                                    style={{
                                        border: '1px solid #ddd',
                                        background: '#f5f5f5',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        height: rowHeights[row] ?? 30,
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 1
                                    }}
                                >
                                    <div style={{ position: 'relative', height: '100%' }}>
                                        {row + 1}

                                        <div
                                            onMouseDown={() => handleMouseDown('row', row)}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                height: '5px',
                                                cursor: 'row-resize'
                                            }}
                                        />
                                    </div>
                                </td>

                                {Array.from({ length: cols }, (_, col) => (
                                    <td
                                        key={col}
                                        style={{
                                            padding: 0,
                                            width: columnWidths[col] ?? 100,
                                            height: rowHeights[row] ?? 30
                                        }}
                                    >
                                        <Cell
                                            row={row}
                                            col={col}
                                            cell={getCellValue(row, col)}
                                            isSelected={
                                                selectedCell?.row === row &&
                                                selectedCell?.col === col
                                            }
                                            isInRange={isCellInRange(row, col)}
                                            onSelect={shiftKey =>
                                                handleCellSelect(row, col, shiftKey)
                                            }
                                            onUpdate={value => {
                                                dispatch(updateCell({ row, col, value }));
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ContextMenu
                menu={contextMenu}
                onClose={() =>
                    setContextMenu(prev => ({
                        ...prev,
                        visible: false
                    }))
                }
                onInsertRowAbove={() => {
                    if (contextMenu.row >= 0) {
                        dispatch(insertRow(contextMenu.row));
                    }
                }}
                onInsertRowBelow={() => {
                    if (contextMenu.row >= 0) {
                        dispatch(insertRow(contextMenu.row + 1));
                    }
                }}
                onDeleteRow={() => {
                    if (contextMenu.row >= 0) {
                        dispatch(deleteRow(contextMenu.row));
                    }
                }}
                onInsertColumnLeft={() => {
                    if (contextMenu.col >= 0) {
                        dispatch(insertColumn(contextMenu.col));
                    }
                }}
                onInsertColumnRight={() => {
                    if (contextMenu.col >= 0) {
                        dispatch(insertColumn(contextMenu.col + 1));
                    }
                }}
                onDeleteColumn={() => {
                    if (contextMenu.col >= 0) {
                        dispatch(deleteColumn(contextMenu.col));
                    }
                }}
            />
        </div>
    );
}
