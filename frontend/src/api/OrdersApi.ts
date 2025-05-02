import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8081/api',
    credentials: 'include',
});

export interface OrderItemDTO {
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface OrderDTO {
    id: number;
    buyerId: number;
    supplierId: number;
    orderDate: string;
    deliveryDate: string;
    status: string;
    totalPrice: number;
    updatedAt: string;
    items: OrderItemDTO[];
}

interface PaginatedOrderResponse {
    content: OrderDTO[];
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

interface OrderSearchParams {
    buyerId?: number;
    supplierId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
}

export const ordersApi = createApi({
    reducerPath: 'ordersApi',
    baseQuery,
    tagTypes: ['Order'],
    endpoints: (builder) => ({
        getOrders: builder.query<PaginatedOrderResponse, { page: number, size: number }>({
            query: ({ page, size }) => ({
                url: '/orders',
                params: { page, size }
            }),
            providesTags: ['Order']
        }),
        searchOrders: builder.query<PaginatedOrderResponse, OrderSearchParams>({
            query: (params) => ({
                url: '/orders/search',
                params: {
                    buyerId: params?.buyerId,
                    supplierId: params?.supplierId,
                    status: params?.status,
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                    page: params?.page || 0,
                    size: params?.size || 10
                }
            }),
            providesTags: ['Order']
        }),
        getOrderById: builder.query<OrderDTO, number>({
            query: (id) => `/orders/${id}`,
            providesTags: (result, error, id) => [{ type: 'Order', id }]
        }),
    })
});

export const {
    useGetOrdersQuery,
    useSearchOrdersQuery,
    useGetOrderByIdQuery,
} = ordersApi;