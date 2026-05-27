import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: {
        id: 'mock-user-1',
        email: 'user@example.com',
        name: 'Тестовый пользователь'
    },
    isAuthenticated: true,
    isLoading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

export const { setUser, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
