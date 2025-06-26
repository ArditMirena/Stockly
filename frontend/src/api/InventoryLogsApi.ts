import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../utils/axiosBaseQuery";

interface InventoryLog {
    id: string;
    warehouseId: number;
    warehouseName: string;
    productId: number;
    productSku: string;
    productTitle: string;
    actionType: string; // RESTOCK, ORDER, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT
    quantityChange: number;
    previousQuantity: number;
    newQuantity: number;
    source: string; // SYSTEM, MANUAL, API, IMPORT
    referenceId: string; // Order ID, Receipt ID, etc.
    referenceType: string; // ORDER, RECEIPT, ADJUSTMENT, etc.
    userId: number; // Who performed the action
    userName: string;
    notes: string;
    timestamp: string;
    metadata: Record<string, any>; // Additional context data
}

interface PaginatedInventoryLogResponse {
    content: InventoryLog[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

interface InventoryLogPaginationParams {
    offset?: number;
    pageSize?: number;
    sortBy?: string;
    direction?: string;
    searchTerm?: string;
    warehouseId?: number;
    productId?: number;
    actionType?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
}

export const inventoryLogsApi = createApi({
    reducerPath: 'inventoryLogsApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['InventoryLog'],
    endpoints: (builder) => ({
        getInventoryLogsWithPagination: builder.query<PaginatedInventoryLogResponse, InventoryLogPaginationParams>({
            query: (params) => ({
                url: 'inventory-logs/page',
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'timestamp',
                    direction: params?.direction || 'desc',
                    searchTerm: params?.searchTerm,
                    warehouseId: params?.warehouseId,
                    productId: params?.productId,
                    actionType: params?.actionType,
                    userId: params?.userId,
                    startDate: params?.startDate,
                    endDate: params?.endDate
                }
            }),
            providesTags: ['InventoryLog']
        }),
        getRecentActivity: builder.query<InventoryLog[], { warehouseId: number, limit: number }>({
            query: ({ warehouseId, limit }) => ({
                url: `inventory-logs/recent/${warehouseId}`,
                method: 'GET',
                params: { limit }
            })
        }),
    }),
});

export const {
    useGetInventoryLogsWithPaginationQuery,
    useGetRecentActivityQuery
} = inventoryLogsApi;