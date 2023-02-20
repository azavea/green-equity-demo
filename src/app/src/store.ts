import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { spendingApi } from './api';

export const store = configureStore({
    reducer: {
        [spendingApi.reducerPath]: spendingApi.reducer,
    },

    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(spendingApi.middleware),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function useAppSelector<T>(selector: (state: AppState) => T): T {
    return useSelector(selector);
}

export function useAppDispatch(): AppDispatch {
    return useDispatch();
}
