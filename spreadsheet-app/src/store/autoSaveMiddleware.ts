import { Middleware, isAction } from '@reduxjs/toolkit';
import { saveDocument } from './slices/documentsSlice';
import { setSaveStatus, setUnsavedChanges } from './slices/uiSlice';

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

export const autoSaveMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);

    if (isAction(action) && (
        action.type === 'spreadsheet/updateCell' ||
        action.type === 'spreadsheet/insertRow' ||
        action.type === 'spreadsheet/deleteRow' ||
        action.type === 'spreadsheet/insertColumn' ||
        action.type === 'spreadsheet/deleteColumn')) {

        const state = store.getState();
        const { currentDocumentId, currentDocumentName } = state.documents;

        if (currentDocumentId) {
            store.dispatch(setUnsavedChanges(true));

            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }

            autoSaveTimer = setTimeout(() => {
                const currentState = store.getState();
                const { cells, rows, cols } = currentState.spreadsheet;

                store.dispatch(setSaveStatus('saving'));
                store.dispatch(saveDocument({
                    id: currentDocumentId,
                    name: currentDocumentName,
                    cells,
                    rows,
                    cols
                }) as any).then(() => {
                    store.dispatch(setSaveStatus('saved'));
                    store.dispatch(setUnsavedChanges(false));
                }).catch(() => {
                    store.dispatch(setSaveStatus('error'));
                });
            }, 500);
        }
    }

    return result;
};
