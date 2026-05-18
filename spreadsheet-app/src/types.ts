export interface CellAddress {
    row: number;
    col: number;
}

export interface Cell {
    value: string;
    computed: string | number | boolean | null;
    formula?: string;
    type: 'number' | 'text' | 'formula' | 'error' | 'boolean';
    dependencies: CellAddress[];
}

export type CellMap = Map<string, Cell>;

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    row: number;
    col: number;
}