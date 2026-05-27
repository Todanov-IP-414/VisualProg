import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import spreadsheetReducer from './slices/spreadsheetSlice';
import documentsReducer from './slices/documentsSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import { autoSaveMiddleware } from './autoSaveMiddleware';

export const store = configureStore({
    reducer: {
        spreadsheet: spreadsheetReducer,
        documents: documentsReducer,
        ui: uiReducer,
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(autoSaveMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
