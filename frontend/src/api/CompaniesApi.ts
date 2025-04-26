import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api/',
    credentials: 'include',
});

export interface AddressDTO {
    id?: number;
    street: string;
    cityId: number;
    postalCode: string;
    country: string;
}

export interface Company {
    id: number;
    companyName: string;
    email: string;
    phoneNumber: string;
    address: AddressDTO;
    companyType: string;
    manager: number;
    createdAt: string;
    updatedAt: string;
}

interface PaginatedCompanyResponse {
    content: Company[];
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
}

export const companiesApi = createApi({
    reducerPath: 'companiesApi',
    baseQuery,
    endpoints: (builder) => ({
        getCompanies: builder.query<Company[], void> ({
            query: () => `/companies`,
        }),
        getCompaniesWithPagination: builder.query<PaginatedCompanyResponse, PaginationParams>({
            query: (params) => ({
                url: '/companies/page',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'id'
                }
            })
        }),
        getCompanyById: builder.query<Company, number> ({
            query: (id) => `/companies/${id}`,
        }),
        addCompany: builder.mutation<Company, Partial<Company>> ({
            query: (company) => ({
                url: `/companies`,
                method: 'POST',
                body: company,
            }),
        }),
        updateCompany: builder.mutation<Company, {id: number, company: Partial<Company>}> ({
            query: ({id, ...company}) => ({
                url: `/companies/${id}`,
                method: 'PUT',
                body: company,
            }),
        }),
        deleteCompany: builder.mutation<void, number> ({
            query: (id) => ({
                url: `/companies/${id}`,
                method: 'DELETE',
            }),
        }),
        searchCompanies: builder.query<Company[], string | void>({
            query: (searchTerm = "") => ({
                url: `/companies/search`,
                params: {
                    searchTerm,
                },
            }),
        })
    }),
});

export const {
    useGetCompaniesQuery,
    useGetCompaniesWithPaginationQuery,
    useGetCompanyByIdQuery,
    useAddCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
    useSearchCompaniesQuery
} = companiesApi;