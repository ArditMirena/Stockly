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

interface PaginationParams {
    offset?: number;
    pageSize?: number;
    sortBy?: string;
    companyId?: number;
}

interface SearchParams {
    searchTerm?: string;
    companyId?: number;
}

export const warehousesApi = createApi({
    reducerPath: 'warehousesApi',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        getAllWarehouses: builder.query<WarehouseDTO[], void> ({
            query: () => ({
                url: `/warehouses`,
                method: 'GET'
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
                    companyId: params?.companyId
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
    }),
});

export const {
    useGetAllWarehousesQuery,
    useGetAllWarehousesWithPaginationQuery,
    useSearchWarehousesQuery,
    useDeleteWarehouseMutation
} = warehousesApi;