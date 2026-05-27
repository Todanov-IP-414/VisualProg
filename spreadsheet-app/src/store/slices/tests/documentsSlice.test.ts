import { describe, it, expect, beforeEach, vi } from 'vitest';
import documentsReducer, {
    createNewDocument,
    renameDocument,
    setCurrentDocument,
    loadDocumentsList,
    loadDocument,
    saveDocument,
    deleteDocument,
    duplicateDocument
} from '../documentsSlice';

vi.mock('../../../utils/storage', () => ({
    saveDocument: vi.fn(),
    loadDocument: vi.fn(),
    deleteDocument: vi.fn(),
    getDocumentsList: vi.fn(() => []),
    generateId: vi.fn(() => 'test-id-123')
}));

describe('documentsSlice', () => {
    const initialState = {
        currentDocumentId: null,
        currentDocumentName: 'Новый документ',
        documentsList: [],
        loadingStatus: 'idle' as const,
        error: null
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен вернуть начальное состояние', () => {
        expect(documentsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('должен создать новый документ', () => {
        const state = documentsReducer(initialState, createNewDocument('Мой документ'));

        expect(state.currentDocumentId).toBe('test-id-123');
        expect(state.currentDocumentName).toBe('Мой документ');
    });

    it('должен переименовать документ', () => {
        const state = documentsReducer(initialState, renameDocument('Новое имя'));

        expect(state.currentDocumentName).toBe('Новое имя');
    });

    it('должен установить текущий документ', () => {
        const state = documentsReducer(initialState, setCurrentDocument({
            id: 'doc-1',
            name: 'Документ 1'
        }));

        expect(state.currentDocumentId).toBe('doc-1');
        expect(state.currentDocumentName).toBe('Документ 1');
    });

    it('должен установить статус загрузки при загрузке списка документов', () => {
        const state = documentsReducer(initialState, loadDocumentsList.pending('', undefined));

        expect(state.loadingStatus).toBe('loading');
    });

    it('должен загрузить список документов', () => {
        const documents = [
            { id: '1', name: 'Doc 1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
            { id: '2', name: 'Doc 2', createdAt: '2026-01-02', updatedAt: '2026-01-02' }
        ];

        const state = documentsReducer(
            initialState,
            loadDocumentsList.fulfilled(documents, '', undefined)
        );

        expect(state.loadingStatus).toBe('succeeded');
        expect(state.documentsList).toEqual(documents);
    });

    it('должен обработать ошибку при загрузке списка документов', () => {
        const error = new Error('Ошибка загрузки');
        const state = documentsReducer(
            initialState,
            loadDocumentsList.rejected(error, '', undefined)
        );

        expect(state.loadingStatus).toBe('failed');
        expect(state.error).toBe('Ошибка загрузки');
    });

    it('должен загрузить документ', () => {
        const doc = {
            id: 'doc-1',
            name: 'Документ 1',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            cells: new Map(),
            rows: 100,
            cols: 10
        };

        const state = documentsReducer(
            initialState,
            loadDocument.fulfilled(doc, '', 'doc-1')
        );

        expect(state.loadingStatus).toBe('succeeded');
        expect(state.currentDocumentId).toBe('doc-1');
        expect(state.currentDocumentName).toBe('Документ 1');
    });

    it('должен сохранить документ и обновить список', () => {
        const stateWithDocs = {
            ...initialState,
            documentsList: [
                { id: 'doc-1', name: 'Старое имя', createdAt: '2026-01-01', updatedAt: '2026-01-01' }
            ]
        };

        const payload = {
            id: 'doc-1',
            name: 'Новое имя',
            updatedAt: '2026-01-02'
        };

        const state = documentsReducer(
            stateWithDocs,
            saveDocument.fulfilled(payload, '', {
                id: 'doc-1',
                name: 'Новое имя',
                cells: {},
                rows: 100,
                cols: 10
            })
        );

        expect(state.documentsList[0].name).toBe('Новое имя');
        expect(state.documentsList[0].updatedAt).toBe('2026-01-02');
    });

    it('должен добавить новый документ в список при сохранении', () => {
        const payload = {
            id: 'doc-new',
            name: 'Новый документ',
            updatedAt: '2026-01-02'
        };

        const state = documentsReducer(
            initialState,
            saveDocument.fulfilled(payload, '', {
                id: 'doc-new',
                name: 'Новый документ',
                cells: {},
                rows: 100,
                cols: 10
            })
        );

        expect(state.documentsList.length).toBe(1);
        expect(state.documentsList[0].id).toBe('doc-new');
        expect(state.documentsList[0].name).toBe('Новый документ');
    });

    it('должен удалить документ из списка', () => {
        const stateWithDocs = {
            ...initialState,
            currentDocumentId: 'doc-1',
            documentsList: [
                { id: 'doc-1', name: 'Doc 1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
                { id: 'doc-2', name: 'Doc 2', createdAt: '2026-01-02', updatedAt: '2026-01-02' }
            ]
        };

        const state = documentsReducer(
            stateWithDocs,
            deleteDocument.fulfilled('doc-1', '', 'doc-1')
        );

        expect(state.documentsList.length).toBe(1);
        expect(state.documentsList[0].id).toBe('doc-2');
        expect(state.currentDocumentId).toBeNull();
        expect(state.currentDocumentName).toBe('Новый документ');
    });

    it('должен дублировать документ', () => {
        const newDoc = {
            id: 'doc-copy',
            name: 'Doc 1 (копия)',
            createdAt: '2026-01-03',
            updatedAt: '2026-01-03',
            cells: new Map(),
            rows: 100,
            cols: 10
        };

        const state = documentsReducer(
            initialState,
            duplicateDocument.fulfilled(newDoc, '', 'doc-1')
        );

        expect(state.documentsList.length).toBe(1);
        expect(state.documentsList[0].id).toBe('doc-copy');
        expect(state.documentsList[0].name).toBe('Doc 1 (копия)');
    });
});
