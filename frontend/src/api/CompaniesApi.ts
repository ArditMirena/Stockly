import { createApi  } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from '../utils/axiosBaseQuery';

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
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        getCompanies: builder.query<Company[], void> ({
            query: () => ({
                url: `/companies`,
                method: 'GET'
            }),
        }),
        getCompaniesByType: builder.query<Company[], string>({
            query: (companyType) => ({
                url: `/companies/type/${companyType}`,
                method: 'GET'
            }),
        }),
        getCompaniesByTypeWithPagination: builder.query<PaginatedCompanyResponse, PaginationParams & { companyType?: string }>({
            query: (params) => ({
                url: '/companies/page',
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'id',
                    companyType: params?.companyType
                }
            })
        }),
        getCompaniesWithPagination: builder.query<PaginatedCompanyResponse, PaginationParams>({
            query: (params) => ({
                url: '/companies/page',
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'id'
                }
            })
        }),
        getCompanyById: builder.query<Company, number> ({
            query: (id) => ({
                url: `/companies/${id}`,
                method: 'GET'
            }),
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
                method: 'GET',
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
    useGetCompaniesByTypeQuery,
    useGetCompaniesByTypeWithPaginationQuery,
    useSearchCompaniesQuery
} = companiesApi;