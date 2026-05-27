import { Cell, CellMap, Document, DocumentListItem } from '../types';

const STORAGE_KEY = 'spreadsheet_documents';

type SerializedDocument = Omit<Document, 'cells'> & {
    cells: [string, Cell][];
};

function isSerializedDocument(data: unknown): data is SerializedDocument {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    const doc = data as Partial<SerializedDocument>;

    return (
        typeof doc.id === 'string' &&
        typeof doc.name === 'string' &&
        typeof doc.createdAt === 'string' &&
        typeof doc.updatedAt === 'string' &&
        typeof doc.rows === 'number' &&
        typeof doc.cols === 'number' &&
        Array.isArray(doc.cells)
    );
}

export function generateId(): string {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
}

export function saveDocument(doc: Document): void {
    const docs = getDocumentsList();

    const documentItem: DocumentListItem = {
        id: doc.id,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    };

    const existingIndex = docs.findIndex(d => d.id === doc.id);

    if (existingIndex >= 0) {
        docs[existingIndex] = documentItem;
    } else {
        docs.push(documentItem);
    }

    localStorage.setItem(
        `${STORAGE_KEY}_list`,
        JSON.stringify(docs)
    );

    const serializedDocument: SerializedDocument = {
        ...doc,
        cells: Array.from(doc.cells.entries())
    };

    localStorage.setItem(
        `${STORAGE_KEY}_${doc.id}`,
        JSON.stringify(serializedDocument)
    );
}

export function loadDocument(id: string): Document | null {
    const rawData = localStorage.getItem(
        `${STORAGE_KEY}_${id}`
    );

    if (!rawData) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(rawData);

        if (!isSerializedDocument(parsed)) {
            throw new Error('Invalid document format');
        }

        const cells: CellMap = new Map<string, Cell>(
            parsed.cells
        );

        return {
            ...parsed,
            cells
        };
    } catch (error) {
        console.error('Failed to load document:', error);

        return null;
    }
}

export function deleteDocument(id: string): void {
    const docs = getDocumentsList();

    const filteredDocs = docs.filter(doc => doc.id !== id);

    localStorage.setItem(
        `${STORAGE_KEY}_list`,
        JSON.stringify(filteredDocs)
    );

    localStorage.removeItem(`${STORAGE_KEY}_${id}`);
}

export function getDocumentsList(): DocumentListItem[] {
    const rawData = localStorage.getItem(
        `${STORAGE_KEY}_list`
    );

    if (!rawData) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(rawData);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            (item): item is DocumentListItem => {
                return (
                    typeof item === 'object' &&
                    item !== null &&
                    typeof item.id === 'string' &&
                    typeof item.name === 'string' &&
                    typeof item.createdAt === 'string' &&
                    typeof item.updatedAt === 'string'
                );
            }
        );
    } catch (error) {
        console.error(
            'Failed to load documents list:',
            error
        );

        return [];
    }
}

export function getDocumentPreview(id: string): string[][] {
    const doc = loadDocument(id);
    if (!doc) {
        return [];
    }

    const preview: string[][] = [];
    for (let r = 0; r < 3; r++) {
        const row: string[] = [];
        for (let c = 0; c < 3; c++) {
            const key = `${r},${c}`;
            const cell = doc.cells.get(key);
            const value = cell?.computed !== undefined ? String(cell.computed) : '';
            row.push(value);
        }
        preview.push(row);
    }
    return preview;
}

export function exportToJSON(doc: Document): string {
    const exportData: SerializedDocument = {
        ...doc,
        cells: Array.from(doc.cells.entries())
    };

    return JSON.stringify(exportData, null, 2);
}

export function importFromJSON(json: string): Document {
    const parsed: unknown = JSON.parse(json);

    if (!isSerializedDocument(parsed)) {
        throw new Error('Invalid import format');
    }

    const cells: CellMap = new Map<string, Cell>(
        parsed.cells
    );

    return {
        id: generateId(),
        name: parsed.name || 'Imported document',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cells,
        rows: parsed.rows,
        cols: parsed.cols
    };
}

export function exportToCSV(cells: CellMap, rows: number, cols: number): string {
    let csv = '';

    for (let r = 0; r < rows; r++) {
        const rowData: string[] = [];
        for (let c = 0; c < cols; c++) {
            const key = `${r},${c}`;
            const cell = cells.get(key);
            const value = cell?.computed !== undefined ? String(cell.computed) : '';
            rowData.push(`"${value.replace(/"/g, '""')}"`);
        }
        csv += rowData.join(',') + '\n';
    }

    return csv;
}

export function importFromCSV(csvText: string): { cells: CellMap; rows: number; cols: number } {
    const lines = csvText.split('\n').filter(line => line.trim());
    const cells: CellMap = new Map();

    let maxCols = 0;

    lines.forEach((line, rowIndex) => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);

        if (values.length > maxCols) {
            maxCols = values.length;
        }

        values.forEach((value, colIndex) => {
            const trimmed = value.trim();
            if (trimmed) {
                const key = `${rowIndex},${colIndex}`;
                const numValue = Number(trimmed);

                if (!isNaN(numValue) && trimmed !== '') {
                    cells.set(key, {
                        value: trimmed,
                        computed: numValue,
                        type: 'number',
                        dependencies: []
                    });
                } else {
                    cells.set(key, {
                        value: trimmed,
                        computed: trimmed,
                        type: 'text',
                        dependencies: []
                    });
                }
            }
        });
    });

    return {
        cells,
        rows: lines.length,
        cols: maxCols
    };
}