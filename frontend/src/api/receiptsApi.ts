import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../utils/axiosBaseQuery";

interface ReceiptItemDTO {
    id: number;
    productId: number;
    productTitle: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface CompanySummaryDTO {
    id: number;
    companyName: string;
    email: string;
    phoneNumber: string;
    address: string;
    companyType: string;
    managerId: number;
    managerName: string;
    managerEmail: string;
}

interface WarehouseSummaryDTO {
    id: number;
    name: string;
    address: string;
}

export interface ReceiptDTO {
    orderId: number;
    orderDate: string;
    deliveryDate: string;
    status: string;
    buyer: CompanySummaryDTO;
    supplier: CompanySummaryDTO;
    sourceWarehouse: WarehouseSummaryDTO | null;
    destinationWarehouse: WarehouseSummaryDTO | null;
    totalPrice: number;
    items: ReceiptItemDTO[];
}

interface PaginationParams {
    offset?: number;
    pageSize?: number;
    sortBy?: string;
    direction?: string;
    searchTerm?: string;
    buyerManagerId?: number;
    supplierManagerId?: number;
    buyerCompanyId?: number;
    supplierCompanyId?: number;
    sourceWarehouseId?: number;
    destinationWarehouseId?: number;
    managerId?: number;
}

interface PaginatedReceiptResponse {
    content: ReceiptDTO[];
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

export const receiptsApi = createApi({
    reducerPath: 'receiptsApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Receipt'],
    endpoints: (builder) => ({
        getReceipts: builder.query<ReceiptDTO[], void>({
            query: () => ({
                url: '/receipts',
                method: 'GET'
            }),
        }),
        getReceiptsWithPagination: builder.query<PaginatedReceiptResponse, PaginationParams>({
            query: (params) => ({
                url: `/receipts/page`,
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'orderId',
                    direction: params?.direction || 'asc',
                    searchTerm: params?.searchTerm,
                    buyerManagerId: params?.buyerManagerId,
                    supplierManagerId: params?.supplierManagerId,
                    buyerCompanyId: params?.buyerCompanyId,
                    supplierCompanyId: params?.supplierCompanyId,
                    sourceWarehouseId: params?.sourceWarehouseId,
                    destinationWarehouseId: params?.destinationWarehouseId,
                    managerId: params?. managerId
                }
            }),
            providesTags: ['Receipt']
        }),
        getReceiptById: builder.query<ReceiptDTO, number>({
            query: (id) => ({
                url: `/receipts/${id}`,
                method: 'GET'
            }),
        }),
        searchReceipts: builder.query<ReceiptDTO[], string | void>({
            query: (searchTerm = "") => ({
                url: '/receipts/search',
                method: 'GET',
                params: { searchTerm },
            }),
        }),
        sendReceipt: builder.mutation<string, number>({
            query: (orderId) => ({
                url: `/receipts/${orderId}/email`,
                method: 'POST'
            }),
        }),
        downloadReceipt: builder.mutation<Blob, number>({
            query: (orderId) => ({
                url: `/receipts/${orderId}/download`,
                method: 'GET',
                responseHandler: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            }),
            transformResponse: (response: Blob) => response,
        }),
    }),
});

export const {
    useGetReceiptsQuery,
    useGetReceiptsWithPaginationQuery,
    useGetReceiptByIdQuery,
    useSearchReceiptsQuery,
    useSendReceiptMutation,
    useDownloadReceiptMutation,
} = receiptsApi;