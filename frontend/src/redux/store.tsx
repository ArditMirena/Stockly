import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { usersApi } from '../api/UsersApi';
import { productsApi } from '../api/ProductsApi';
import { companiesApi } from '../api/CompaniesApi';
import { warehousesApi} from "../api/WarehousesApi.ts";
import { ordersApi } from '../api/ordersApi';
import { setupListeners } from '@reduxjs/toolkit/query';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [companiesApi.reducerPath]: companiesApi.reducer,
    [warehousesApi.reducerPath]: warehousesApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(usersApi.middleware)
      .concat(productsApi.middleware)
      .concat(companiesApi.middleware)
      .concat(warehousesApi.middleware)
      .concat(ordersApi.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;