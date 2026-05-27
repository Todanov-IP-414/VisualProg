import { describe, it, expect } from 'vitest';
import uiReducer, {
    openDocumentModal,
    closeDocumentModal,
    openNewDocumentModal,
    closeNewDocumentModal,
    setUnsavedChanges,
    setSaveStatus,
    showNotification,
    hideNotification
} from '../uiSlice';

describe('uiSlice', () => {
    const initialState = {
        isDocumentModalOpen: false,
        isNewDocumentModalOpen: false,
        unsavedChanges: false,
        saveStatus: 'saved' as const,
        notification: null
    };

    it('должен вернуть начальное состояние', () => {
        expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('должен открыть модальное окно документов', () => {
        const state = uiReducer(initialState, openDocumentModal());

        expect(state.isDocumentModalOpen).toBe(true);
    });

    it('должен закрыть модальное окно документов', () => {
        const state = uiReducer(
            { ...initialState, isDocumentModalOpen: true },
            closeDocumentModal()
        );

        expect(state.isDocumentModalOpen).toBe(false);
    });

    it('должен открыть модальное окно нового документа', () => {
        const state = uiReducer(initialState, openNewDocumentModal());

        expect(state.isNewDocumentModalOpen).toBe(true);
    });

    it('должен закрыть модальное окно нового документа', () => {
        const state = uiReducer(
            { ...initialState, isNewDocumentModalOpen: true },
            closeNewDocumentModal()
        );

        expect(state.isNewDocumentModalOpen).toBe(false);
    });

    it('должен установить флаг несохраненных изменений', () => {
        const state = uiReducer(initialState, setUnsavedChanges(true));

        expect(state.unsavedChanges).toBe(true);
    });

    it('должен сбросить флаг несохраненных изменений', () => {
        const state = uiReducer(
            { ...initialState, unsavedChanges: true },
            setUnsavedChanges(false)
        );

        expect(state.unsavedChanges).toBe(false);
    });

    it('должен установить статус сохранения "saving"', () => {
        const state = uiReducer(initialState, setSaveStatus('saving'));

        expect(state.saveStatus).toBe('saving');
    });

    it('должен установить статус сохранения "saved"', () => {
        const state = uiReducer(initialState, setSaveStatus('saved'));

        expect(state.saveStatus).toBe('saved');
    });

    it('должен установить статус сохранения "error"', () => {
        const state = uiReducer(initialState, setSaveStatus('error'));

        expect(state.saveStatus).toBe('error');
    });

    it('должен показать уведомление об успехе', () => {
        const state = uiReducer(initialState, showNotification({
            message: 'Успешно сохранено',
            type: 'success'
        }));

        expect(state.notification).toEqual({
            message: 'Успешно сохранено',
            type: 'success'
        });
    });

    it('должен показать уведомление об ошибке', () => {
        const state = uiReducer(initialState, showNotification({
            message: 'Произошла ошибка',
            type: 'error'
        }));

        expect(state.notification).toEqual({
            message: 'Произошла ошибка',
            type: 'error'
        });
    });

    it('должен показать информационное уведомление', () => {
        const state = uiReducer(initialState, showNotification({
            message: 'Информация',
            type: 'info'
        }));

        expect(state.notification).toEqual({
            message: 'Информация',
            type: 'info'
        });
    });

    it('должен скрыть уведомление', () => {
        const stateWithNotification = {
            ...initialState,
            notification: {
                message: 'Тест',
                type: 'info' as const
            }
        };

        const state = uiReducer(stateWithNotification, hideNotification());

        expect(state.notification).toBeNull();
    });
});
