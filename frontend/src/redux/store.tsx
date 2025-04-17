import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.tsx';
import { usersApi } from '../api/UsersApi';
import { setupListeners } from '@reduxjs/toolkit/query';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [usersApi.reducerPath]: usersApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(usersApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;
