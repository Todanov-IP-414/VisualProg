import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Document, DocumentListItem, CellMap, Cell } from '../../types';
import {
    saveDocument as saveDocToStorage,
    loadDocument as loadDocFromStorage,
    deleteDocument as deleteDocFromStorage,
    getDocumentsList,
    generateId
} from '../../utils/storage';

interface DocumentsState {
    currentDocumentId: string | null;
    currentDocumentName: string;
    documentsList: DocumentListItem[];
    loadingStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: DocumentsState = {
    currentDocumentId: null,
    currentDocumentName: 'Новый документ',
    documentsList: [],
    loadingStatus: 'idle',
    error: null
};

export const loadDocumentsList = createAsyncThunk(
    'documents/loadList',
    async () => {
        return getDocumentsList();
    }
);

export const loadDocument = createAsyncThunk(
    'documents/load',
    async (id: string) => {
        const doc = loadDocFromStorage(id);
        if (!doc) {
            throw new Error('Документ не найден');
        }
        return doc;
    }
);

export const saveDocument = createAsyncThunk(
    'documents/save',
    async (payload: { id: string; name: string; cells: Record<string, Cell>; rows: number; cols: number }) => {
        const { id, name, cells, rows, cols } = payload;

        const existingDoc = loadDocFromStorage(id);
        const now = new Date().toISOString();

        const cellMap: CellMap = new Map(Object.entries(cells));

        const doc: Document = {
            id,
            name,
            createdAt: existingDoc?.createdAt || now,
            updatedAt: now,
            cells: cellMap,
            rows,
            cols
        };

        saveDocToStorage(doc);
        return { id, name, updatedAt: now };
    }
);

export const deleteDocument = createAsyncThunk(
    'documents/delete',
    async (id: string) => {
        deleteDocFromStorage(id);
        return id;
    }
);

export const duplicateDocument = createAsyncThunk(
    'documents/duplicate',
    async (id: string) => {
        const doc = loadDocFromStorage(id);
        if (!doc) {
            throw new Error('Документ не найден');
        }

        const newId = generateId();
        const newDoc: Document = {
            ...doc,
            id: newId,
            name: doc.name + ' (копия)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        saveDocToStorage(newDoc);
        return newDoc;
    }
);

const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        createNewDocument: (state, action: PayloadAction<string>) => {
            const newId = generateId();
            state.currentDocumentId = newId;
            state.currentDocumentName = action.payload;
        },
        renameDocument: (state, action: PayloadAction<string>) => {
            state.currentDocumentName = action.payload;
        },
        setCurrentDocument: (state, action: PayloadAction<{ id: string; name: string }>) => {
            state.currentDocumentId = action.payload.id;
            state.currentDocumentName = action.payload.name;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadDocumentsList.pending, (state) => {
                state.loadingStatus = 'loading';
            })
            .addCase(loadDocumentsList.fulfilled, (state, action) => {
                state.loadingStatus = 'succeeded';
                state.documentsList = action.payload;
            })
            .addCase(loadDocumentsList.rejected, (state, action) => {
                state.loadingStatus = 'failed';
                state.error = action.error.message || 'Ошибка загрузки списка документов';
            })
            .addCase(loadDocument.pending, (state) => {
                state.loadingStatus = 'loading';
            })
            .addCase(loadDocument.fulfilled, (state, action) => {
                state.loadingStatus = 'succeeded';
                state.currentDocumentId = action.payload.id;
                state.currentDocumentName = action.payload.name;
            })
            .addCase(loadDocument.rejected, (state, action) => {
                state.loadingStatus = 'failed';
                state.error = action.error.message || 'Ошибка загрузки документа';
            })
            .addCase(saveDocument.fulfilled, (state, action) => {
                const index = state.documentsList.findIndex(doc => doc.id === action.payload.id);
                if (index !== -1) {
                    state.documentsList[index].name = action.payload.name;
                    state.documentsList[index].updatedAt = action.payload.updatedAt;
                } else {
                    state.documentsList.push({
                        id: action.payload.id,
                        name: action.payload.name,
                        createdAt: action.payload.updatedAt,
                        updatedAt: action.payload.updatedAt
                    });
                }
            })
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.documentsList = state.documentsList.filter(doc => doc.id !== action.payload);
                if (state.currentDocumentId === action.payload) {
                    state.currentDocumentId = null;
                    state.currentDocumentName = 'Новый документ';
                }
            })
            .addCase(duplicateDocument.fulfilled, (state, action) => {
                state.documentsList.push({
                    id: action.payload.id,
                    name: action.payload.name,
                    createdAt: action.payload.createdAt,
                    updatedAt: action.payload.updatedAt
                });
            });
    }
});

export const { createNewDocument, renameDocument, setCurrentDocument } = documentsSlice.actions;
export default documentsSlice.reducer;
