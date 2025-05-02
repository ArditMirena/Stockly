import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { usersApi } from '../api/UsersApi';
import { productsApi } from '../api/ProductsApi';
import { companiesApi } from '../api/CompaniesApi';
import { ordersApi } from '../api/OrdersApi';  // Add this import
import { setupListeners } from '@reduxjs/toolkit/query';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [companiesApi.reducerPath]: companiesApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer  // Add this line
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(usersApi.middleware)
      .concat(productsApi.middleware)
      .concat(companiesApi.middleware)
      .concat(ordersApi.middleware)  // Add this line
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;