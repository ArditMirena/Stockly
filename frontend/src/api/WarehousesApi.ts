import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../utils/axiosBaseQuery";

export interface AddressDTO {
    street: string;
    postalCode: string;
    cityId: number;
    country: string;
}

export interface WarehouseDTO {
    id: number;
    name: string;
    address: AddressDTO;
    companyId: number;
}

export interface WarehouseProductDTO {
    id: number;
    warehouseId: number;
    warehouseName: string;
    productId: number;
    quantity: number;
    availability: string;
    createdAt: string;
    updatedAt: string;
    productTitle: string;
    productSku: string;
    productThumbnail: string;
    unitPrice: number;
}

interface PaginatedWarehouseResponse {
    content: WarehouseDTO[];
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

export interface PaginatedWarehouseProductResponse {
    content: WarehouseProductDTO[];
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

interface PaginationParams {
    offset?: number;
    pageSize?: number;
    sortBy?: string;
    companyId?: number;
    managerId?: number;
    warehouseId?: number;
}

interface SearchParams {
    searchTerm?: string;
    companyId?: number;
}

export const warehousesApi = createApi({
    reducerPath: 'warehousesApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Warehouse'],
    endpoints: (builder) => ({
        getAllWarehouses: builder.query<WarehouseDTO[], void> ({
            query: () => ({
                url: `/warehouses`,
                method: 'GET'
            })
        }),
        addWarehouse: builder.mutation<WarehouseDTO, Partial<WarehouseDTO>>({
            query: (warehouse) => ({
                url: `/warehouses`,
                method: 'POST',
                data: warehouse,
            })
        }),
        getAllWarehousesWithPagination: builder.query<PaginatedWarehouseResponse, PaginationParams>({
            query: (params) => ({
                url: '/warehouses/page',
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'id',
                    companyId: params?.companyId,
                    managerId: params?.managerId
                }
            })
        }),
        searchWarehouses: builder.query<WarehouseDTO[], SearchParams>({
            query: ({ searchTerm, companyId }) => ({
                url: '/warehouses/search',
                method: 'GET',
                params: {
                    searchTerm,
                    companyId
                }
            })
        }),
        deleteWarehouse: builder.mutation<void, number>({
            query: (id) => ({
                url: `/warehouses/${id}`,
                method: 'DELETE',
            }),
        }),
        getWarehousesCount: builder.query<number, void>({
            query: () => ({
                url: `/warehouses/count`,
                method: 'GET',
            }),
        }),
        getWarehouseProducts: builder.query<WarehouseProductDTO[], { warehouseId: number }>({
            query: ({ warehouseId }) => ({
                url: `/warehouses/${warehouseId}/products`,
                method: 'GET'
            }),
            providesTags: ['Warehouse']
        }),
        assignProductToWarehouse: builder.mutation<void, { productId: number; quantity: number; warehouseId: number }>({
            query: ({ productId, quantity, warehouseId }) => ({
                url: `/warehouses/assign-product/${productId}/${quantity}/towarehouse/${warehouseId}`,
                method: 'POST',
            }),
        }),
        getWarehousesByManager: builder.query<WarehouseDTO[], number>({
            query: (managerId) => ({
                url: `/warehouses/manager/${managerId}`,
                method: 'GET'
            }),
            providesTags: ['Warehouse']
        }),
        getWarehouseProductsWithPagination: builder.query<PaginatedWarehouseProductResponse, PaginationParams>({
            query: (params) => ({
                url: '/warehouses/products/page',
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'id',
                    warehouseId: params?.warehouseId,
                    managerId: params?.managerId
                }
            }),
            providesTags: ['Warehouse']
        }),
    }),
});

export const {
    useGetAllWarehousesQuery,
    useGetAllWarehousesWithPaginationQuery,
    useSearchWarehousesQuery,
    useDeleteWarehouseMutation,
    useGetWarehouseProductsQuery,
    useGetWarehousesCountQuery,
    useAssignProductToWarehouseMutation,
    useGetWarehouseProductsWithPaginationQuery,
    useAddWarehouseMutation,
    useGetWarehousesByManagerQuery
} = warehousesApi;