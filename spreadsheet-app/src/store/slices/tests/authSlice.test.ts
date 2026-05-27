import { describe, it, expect } from 'vitest';
import authReducer, {
    setUser,
    logout,
    setLoading,
    setError
} from '../authSlice';

describe('authSlice', () => {
    const initialState = {
        user: {
            id: 'mock-user-1',
            email: 'user@example.com',
            name: 'Тестовый пользователь'
        },
        isAuthenticated: true,
        isLoading: false,
        error: null
    };

    it('должен вернуть начальное состояние', () => {
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('должен установить пользователя', () => {
        const newUser = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Тестовый Пользователь'
        };

        const state = authReducer(initialState, setUser(newUser));

        expect(state.user).toEqual(newUser);
        expect(state.isAuthenticated).toBe(true);
    });

    it('должен выполнить выход', () => {
        const state = authReducer(initialState, logout());

        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });

    it('должен установить флаг загрузки', () => {
        const state = authReducer(initialState, setLoading(true));

        expect(state.isLoading).toBe(true);
    });

    it('должен сбросить флаг загрузки', () => {
        const stateWithLoading = { ...initialState, isLoading: true };
        const state = authReducer(stateWithLoading, setLoading(false));

        expect(state.isLoading).toBe(false);
    });

    it('должен установить ошибку', () => {
        const state = authReducer(initialState, setError('Ошибка аутентификации'));

        expect(state.error).toBe('Ошибка аутентификации');
    });

    it('должен сбросить ошибку', () => {
        const stateWithError = { ...initialState, error: 'Ошибка' };
        const state = authReducer(stateWithError, setError(null));

        expect(state.error).toBeNull();
    });
});
