import { CellAddress } from '../types';

export function parseAddress(addr: string): CellAddress | null {
    const match = addr.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;

    const colStr = match[1];
    const rowStr = match[2];

    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 65 + 1);
    }
    col -= 1;

    const row = parseInt(rowStr) - 1;

    return { row, col };
}

export function parseRange(range: string): CellAddress[] | null {
    const parts = range.split(':');
    if (parts.length !== 2) return null;

    const start = parseAddress(parts[0]);
    const end = parseAddress(parts[1]);

    if (!start || !end) return null;

    const cells: CellAddress[] = [];
    for (let row = Math.min(start.row, end.row); row <=
        Math.max(start.row, end.row); row++) {
        for (let col = Math.min(start.col, end.col); col <=
            Math.max(start.col, end.col); col++) {
            cells.push({ row, col });
        }
    }

    return cells;
}

export function addressToString(addr: CellAddress): string {
    let col = addr.col;
    let colStr = '';

    while (col >= 0) {
        colStr = String.fromCharCode(65 + (col % 26)) + colStr;
        col = Math.floor(col / 26) - 1;
    }

    return colStr + (addr.row + 1);
}

export function getCellKey(row: number, col: number): string {
    return `${row},${col}`;
}

export function hasCycle(
    cellKey: string,
    dependencies: CellAddress[],
    cellMap: Map<string, any>,
    visited = new Set<string>()
): boolean {
    if (visited.has(cellKey)) return true;
    visited.add(cellKey);

    for (const dep of dependencies) {
        const depKey = getCellKey(dep.row, dep.col);
        const depCell = cellMap.get(depKey);
        if (depCell && depCell.dependencies) {
            if (hasCycle(depKey, depCell.dependencies, cellMap, new
                Set(visited))) {
                return true;
            }
        }
    }

    return false;
}