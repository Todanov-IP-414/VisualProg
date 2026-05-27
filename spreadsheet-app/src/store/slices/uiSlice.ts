import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    isDocumentModalOpen: boolean;
    isNewDocumentModalOpen: boolean;
    unsavedChanges: boolean;
    saveStatus: 'saved' | 'saving' | 'error';
    notification: {
        message: string;
        type: 'success' | 'error' | 'info';
    } | null;
}

const initialState: UiState = {
    isDocumentModalOpen: false,
    isNewDocumentModalOpen: false,
    unsavedChanges: false,
    saveStatus: 'saved',
    notification: null
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openDocumentModal: (state) => {
            state.isDocumentModalOpen = true;
        },
        closeDocumentModal: (state) => {
            state.isDocumentModalOpen = false;
        },
        openNewDocumentModal: (state) => {
            state.isNewDocumentModalOpen = true;
        },
        closeNewDocumentModal: (state) => {
            state.isNewDocumentModalOpen = false;
        },
        setUnsavedChanges: (state, action: PayloadAction<boolean>) => {
            state.unsavedChanges = action.payload;
        },
        setSaveStatus: (state, action: PayloadAction<'saved' | 'saving' | 'error'>) => {
            state.saveStatus = action.payload;
        },
        showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
            state.notification = action.payload;
        },
        hideNotification: (state) => {
            state.notification = null;
        }
    }
});

export const {
    openDocumentModal,
    closeDocumentModal,
    openNewDocumentModal,
    closeNewDocumentModal,
    setUnsavedChanges,
    setSaveStatus,
    showNotification,
    hideNotification
} = uiSlice.actions;

export default uiSlice.reducer;
