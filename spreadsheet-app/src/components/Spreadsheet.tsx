import { useState } from 'react';
import type { MouseEvent } from 'react';

import { Cell } from './Cell';
import { ContextMenu } from './ContextMenu';
import { useSpreadsheet } from '../hooks/useSpreadsheet';
import { addressToString } from '../utils/helpers';
import { ContextMenuState } from '../types';

const MIN_COL_WIDTH = 50;
const MIN_ROW_HEIGHT = 20;

export function Spreadsheet() {
    const {
        selectedCell,
        setSelectedCell,
        selectedRange,
        setSelectedRange,
        updateCell,
        getCellValue,
        rows,
        cols
    } = useSpreadsheet();

    const [contextMenu, setContextMenu] =
        useState<ContextMenuState>({
            visible: false,
            x: 0,
            y: 0,
            row: 0,
            col: 0
        });

    const [columnWidths, setColumnWidths] =
        useState<number[]>(() =>
            Array(cols).fill(100)
        );

    const [rowHeights, setRowHeights] =
        useState<number[]>(() =>
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
            label =
                String.fromCharCode(
                    65 + (current % 26)
                ) + label;

            current =
                Math.floor(current / 26) - 1;
        }

        return label;
    };

    const handleCellSelect = (
        row: number,
        col: number,
        shiftKey: boolean
    ) => {
        if (shiftKey && selectedCell) {
            setSelectedRange({
                start: selectedCell,
                end: { row, col }
            });

            return;
        }

        setSelectedCell({ row, col });
        setSelectedRange(null);
    };

    const isCellInRange = (
        row: number,
        col: number
    ): boolean => {
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

    const handleContextMenu = (
        e: MouseEvent,
        row: number,
        col: number
    ) => {
        e.preventDefault();

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            row,
            col
        });
    };

    const handleMouseDown = (
        type: 'col' | 'row',
        index: number
    ) => {
        setResizing({ type, index });
    };

    const handleMouseMove = (
        e: MouseEvent<HTMLDivElement>
    ) => {
        if (!resizing) {
            return;
        }

        if (resizing.type === 'col') {
            setColumnWidths(prev => {
                const next = [...prev];

                next[resizing.index] = Math.max(
                    MIN_COL_WIDTH,
                    (next[resizing.index] ?? 100) +
                    e.movementX
                );

                return next;
            });
        } else {
            setRowHeights(prev => {
                const next = [...prev];

                next[resizing.index] = Math.max(
                    MIN_ROW_HEIGHT,
                    (next[resizing.index] ?? 30) +
                    e.movementY
                );

                return next;
            });
        }
    };

    const handleMouseUp = () => {
        setResizing(null);
    };

    const selectedCellData = selectedCell
        ? getCellValue(
            selectedCell.row,
            selectedCell.col
        )
        : undefined;

    return (
        <div
            style={{ padding: '20px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Formula bar */}
            <div style={{ marginBottom: '10px' }}>
                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center'
                    }}
                >
                    <span
                        style={{
                            fontWeight: 'bold'
                        }}
                    >
                        {selectedCell
                            ? addressToString(
                                selectedCell
                            )
                            : ''}
                    </span>

                    <input
                        type="text"
                        value={
                            selectedCellData?.value ??
                            ''
                        }
                        placeholder="Введите значение или формулу"
                        onChange={e => {
                            if (!selectedCell) {
                                return;
                            }

                            updateCell(
                                selectedCell.row,
                                selectedCell.col,
                                e.target.value
                            );
                        }}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border:
                                '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div
                style={{
                    overflow: 'auto',
                    maxHeight: '600px',
                    border: '1px solid #ccc'
                }}
            >
                <table
                    style={{
                        borderCollapse: 'collapse',
                        width: '100%'
                    }}
                >
                    <thead>
                        <tr>
                            <th
                                style={{
                                    border:
                                        '1px solid #ddd',
                                    background:
                                        '#f5f5f5',
                                    minWidth: '40px',
                                    position:
                                        'sticky',
                                    top: 0,
                                    left: 0,
                                    zIndex: 3
                                }}
                            />

                            {Array.from(
                                { length: cols },
                                (_, col) => (
                                    <th
                                        key={col}
                                        onContextMenu={e =>
                                            handleContextMenu(
                                                e,
                                                -1,
                                                col
                                            )
                                        }
                                        style={{
                                            border:
                                                '1px solid #ddd',
                                            background:
                                                '#f5f5f5',
                                            width:
                                                columnWidths[
                                                col
                                                ],
                                            position:
                                                'sticky',
                                            top: 0,
                                            zIndex: 2
                                        }}
                                    >
                                        <div
                                            style={{
                                                position:
                                                    'relative'
                                            }}
                                        >
                                            {getColumnLabel(
                                                col
                                            )}

                                            <div
                                                onMouseDown={() =>
                                                    handleMouseDown(
                                                        'col',
                                                        col
                                                    )
                                                }
                                                style={{
                                                    position:
                                                        'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    width:
                                                        '5px',
                                                    cursor:
                                                        'col-resize'
                                                }}
                                            />
                                        </div>
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from(
                            { length: rows },
                            (_, row) => (
                                <tr key={row}>
                                    <td
                                        onContextMenu={e =>
                                            handleContextMenu(
                                                e,
                                                row,
                                                -1
                                            )
                                        }
                                        style={{
                                            border:
                                                '1px solid #ddd',
                                            background:
                                                '#f5f5f5',
                                            textAlign:
                                                'center',
                                            fontWeight:
                                                'bold',
                                            height:
                                                rowHeights[
                                                row
                                                ],
                                            position:
                                                'sticky',
                                            left: 0,
                                            zIndex: 1
                                        }}
                                    >
                                        <div
                                            style={{
                                                position:
                                                    'relative',
                                                height:
                                                    '100%'
                                            }}
                                        >
                                            {row + 1}

                                            <div
                                                onMouseDown={() =>
                                                    handleMouseDown(
                                                        'row',
                                                        row
                                                    )
                                                }
                                                style={{
                                                    position:
                                                        'absolute',
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    height:
                                                        '5px',
                                                    cursor:
                                                        'row-resize'
                                                }}
                                            />
                                        </div>
                                    </td>

                                    {Array.from(
                                        {
                                            length: cols
                                        },
                                        (_, col) => (
                                            <td
                                                key={col}
                                                style={{
                                                    padding: 0,
                                                    width:
                                                        columnWidths[
                                                        col
                                                        ],
                                                    height:
                                                        rowHeights[
                                                        row
                                                        ]
                                                }}
                                            >
                                                <Cell
                                                    row={row}
                                                    col={col}
                                                    cell={getCellValue(
                                                        row,
                                                        col
                                                    )}
                                                    isSelected={
                                                        selectedCell?.row ===
                                                        row &&
                                                        selectedCell?.col ===
                                                        col
                                                    }
                                                    isInRange={isCellInRange(
                                                        row,
                                                        col
                                                    )}
                                                    onSelect={shiftKey =>
                                                        handleCellSelect(
                                                            row,
                                                            col,
                                                            shiftKey
                                                        )
                                                    }
                                                    onUpdate={value =>
                                                        updateCell(
                                                            row,
                                                            col,
                                                            value
                                                        )
                                                    }
                                                />
                                            </td>
                                        )
                                    )}
                                </tr>
                            )
                        )}
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
                onInsertRowAbove={() => { }}
                onInsertRowBelow={() => { }}
                onDeleteRow={() => { }}
                onInsertColumnLeft={() => { }}
                onInsertColumnRight={() => { }}
                onDeleteColumn={() => { }}
            />
        </div>
    );
}