import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../utils/axiosBaseQuery';

export interface PredictionMetadata {
    version: string;
    source: string;
    created_at: string;
    prediction_run_id: string;
}

export interface Recommendation {
    safety_stock: number;
    suggested_restock: number;
}

export interface StockData {
    current: number;
    days_remaining: number;
}

export interface DemandForecast {
    daily_avg: number;
    daily_predicted: number;
    weekly_predicted_7d: number;
}

export interface PredictionResult {
    id: string;
    metadata: PredictionMetadata;
    recommendation: Recommendation;
    warehouse_id: number;
    product_id: number;
    data_hash: string;
    stock_data: StockData;
    demand_forecast: DemandForecast;
}

export const predictionsApi = createApi({
    reducerPath: 'predictionsApi',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        getCurrentPredictions: builder.query<PredictionResult[], void>({
            query: () => ({ url: 'predictions/current', method: 'get' }),
        }),
        getPredictionsByMonth: builder.query<PredictionResult[], string>({
            query: (month) => ({ url: `predictions/${month}`, method: 'get' }),
        }),
        getPredictionsByWarehouse: builder.query<PredictionResult[], { month: string; warehouseId: number }>({
            query: ({ month, warehouseId }) => ({
                url: `predictions/${month}/warehouse/${warehouseId}`,
                method: 'get',
            }),
        }),
        getPredictionsByProduct: builder.query<PredictionResult[], { month: string; productId: number }>({
            query: ({ month, productId }) => ({
                url: `predictions/${month}/product/${productId}`,
                method: 'get',
            }),
        }),
    }),
});

export const {
    useGetCurrentPredictionsQuery,
    useGetPredictionsByMonthQuery,
    useGetPredictionsByWarehouseQuery,
    useGetPredictionsByProductQuery,
} = predictionsApi;