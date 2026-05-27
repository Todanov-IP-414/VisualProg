import { useState, useCallback, useRef, useEffect } from 'react';
import { Document, DocumentListItem, CellMap } from '../types';
import {
    saveDocument,
    loadDocument,
    deleteDocument as deleteDocFromStorage,
    getDocumentsList,
    exportToJSON,
    importFromJSON,
    exportToCSV,
    importFromCSV,
    generateId
} from '../utils/storage';

export function useDocuments() {
    const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
    const [currentDocumentName, setCurrentDocumentName] = useState<string>('Новый документ');
    const [documentsList, setDocumentsList] = useState<DocumentListItem[]>(() =>
        getDocumentsList());
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingSaveRef = useRef<{ cells: CellMap; rows: number; cols: number } | null>(null);

    const createNewDocument = useCallback((name: string) => {
        const newId = generateId();
        setCurrentDocumentId(newId);
        setCurrentDocumentName(name);
        setUnsavedChanges(false);
        return newId;
    }, []);

    const saveCurrentDocument = useCallback((cells: CellMap, rows: number, cols: number) => {
        if (!currentDocumentId) {
            return;
        }

        try {
            setSaveStatus('saving');
            const now = new Date().toISOString();
            const existingDoc = loadDocument(currentDocumentId);

            const doc: Document = {
                id: currentDocumentId,
                name: currentDocumentName,
                createdAt: existingDoc?.createdAt || now,
                updatedAt: now,
                cells,
                rows,
                cols
            };

            saveDocument(doc);
            setDocumentsList(getDocumentsList());
            setUnsavedChanges(false);
            setSaveStatus('saved');
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
        }
    }, [currentDocumentId, currentDocumentName]);

    const triggerAutoSave = useCallback((cells: CellMap, rows: number, cols: number) => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        pendingSaveRef.current = { cells, rows, cols };

        autoSaveTimerRef.current = setTimeout(() => {
            if (pendingSaveRef.current && currentDocumentId) {
                saveCurrentDocument(
                    pendingSaveRef.current.cells,
                    pendingSaveRef.current.rows,
                    pendingSaveRef.current.cols
                );
                pendingSaveRef.current = null;
            }
        }, 500);
    }, [currentDocumentId, saveCurrentDocument]);

    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

    const openDocument = useCallback((id: string): { cells: CellMap; rows: number; cols: number } |
        null => {
        const doc = loadDocument(id);

        if (!doc) {
            return null;
        }

        setCurrentDocumentId(doc.id);
        setCurrentDocumentName(doc.name);
        setUnsavedChanges(false);

        return {
            cells: doc.cells,
            rows: doc.rows,
            cols: doc.cols
        };
    }, []);

    const deleteDocument = useCallback((id: string) => {
        deleteDocFromStorage(id);
        setDocumentsList(getDocumentsList());

        if (currentDocumentId === id) {
            setCurrentDocumentId(null);
            setCurrentDocumentName('Новый документ');
        }
    }, [currentDocumentId]);

    const duplicateDocument = useCallback((id: string) => {
        const doc = loadDocument(id);
        if (!doc) return;

        const newId = generateId();
        const newDoc: Document = {
            ...doc,
            id: newId,
            name: doc.name + ' (копия)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        saveDocument(newDoc);
        setDocumentsList(getDocumentsList());
    }, []);

    const renameDocument = useCallback((newName: string) => {
        setCurrentDocumentName(newName);
        setUnsavedChanges(true);
    }, []);

    const exportDocument = useCallback((cells: CellMap, rows: number, cols: number) => {
        const doc: Document = {
            id: currentDocumentId || generateId(),
            name: currentDocumentName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cells,
            rows,
            cols
        };

        const json = exportToJSON(doc);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDocumentName}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [currentDocumentId, currentDocumentName]);

    const exportDocumentCSV = useCallback((cells: CellMap, rows: number, cols: number) => {
        const csv = exportToCSV(cells, rows, cols);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDocumentName}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [currentDocumentName]);

    const importDocument = useCallback((file: File): Promise<{
        cells: CellMap; rows: number; cols:
        number
    }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const json = e.target?.result as string;
                    const doc = importFromJSON(json);

                    setCurrentDocumentId(doc.id);
                    setCurrentDocumentName(doc.name);
                    setUnsavedChanges(false);

                    resolve({
                        cells: doc.cells,
                        rows: doc.rows,
                        cols: doc.cols
                    });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }, []);

    const importDocumentCSV = useCallback((file: File): Promise<{
        cells: CellMap; rows: number; cols: number
    }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const csvText = e.target?.result as string;
                    const result = importFromCSV(csvText);

                    setCurrentDocumentId(generateId());
                    setCurrentDocumentName(file.name.replace('.csv', ''));
                    setUnsavedChanges(false);

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }, []);

    const markAsChanged = useCallback(() => {
        setUnsavedChanges(true);
    }, []);

    return {
        currentDocumentId,
        currentDocumentName,
        documentsList,
        unsavedChanges,
        saveStatus,
        createNewDocument,
        saveCurrentDocument,
        openDocument,
        deleteDocument,
        duplicateDocument,
        renameDocument,
        exportDocument,
        exportDocumentCSV,
        importDocument,
        importDocumentCSV,
        markAsChanged,
        triggerAutoSave
    };
}