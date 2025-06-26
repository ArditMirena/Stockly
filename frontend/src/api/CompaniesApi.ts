import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from '../utils/axiosBaseQuery';

// Interface Definitions
export interface AddressDTO {
    id?: number;
    street: string;
    cityId: number;
    postalCode: string;
    country?: string;
}

export interface Country {
    id: number;
    name: string;
    isoCode: string;
}

export interface City {
    id: number;
    name: string;
    country: Country;
}

export interface Company {
    id: number;
    companyName: string;
    email: string;
    phoneNumber: string;
    address: AddressDTO;
    companyType: string;
    manager: number;
    createdAt?: string;
    updatedAt?: string;
    businessType?: string;
    hasProductionFacility?: boolean;
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
    direction?: string;
    searchTerm?: string;
    companyType?: string;
    managerId?: number;
}

// API Definition
export const companiesApi = createApi({
    reducerPath: 'companiesApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Company', 'Country', 'City'],
    endpoints: (builder) => ({
        // Company Endpoints
        getCompanies: builder.query<Company[], void>({
            query: () => ({
                url: `/companies`,
                method: 'GET'
            }),
            providesTags: ['Company']
        }),

        getCompaniesByType: builder.query<Company[], string>({
            query: (companyType) => ({
                url: `/companies/type/${companyType}`,
                method: 'GET'
            }),
            providesTags: ['Company']
        }),

        getCompaniesWithPagination: builder.query<PaginatedCompanyResponse, PaginationParams>({
            query: (params) => ({
                url: '/companies/page',
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'id',
                    direction: params?.direction || 'asc',
                    searchTerm: params?.searchTerm || '',
                    companyType: params?.companyType,
                    managerId: params?.managerId
                }
            }),
            providesTags: ['Company']
        }),

        getCompanyById: builder.query<Company, number>({
            query: (id) => ({
                url: `/companies/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Company', id }]
        }),

        addCompany: builder.mutation<Company, Partial<Company>>({
            query: (company) => ({
                url: `/companies`,
                method: 'POST',
                data: company,
            }),
            invalidatesTags: ['Company']
        }),

        updateCompany: builder.mutation<Company, { id: number, company: Partial<Company> }>({
            query: ({ id, ...company }) => ({
                url: `/companies/${id}`,
                method: 'PUT',
                data: company,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }]
        }),

        deleteCompany: builder.mutation<void, number>({
            query: (id) => ({
                url: `/companies/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Company']
        }),

        searchCompanies: builder.query<Company[], string | void>({
            query: (searchTerm = "") => ({
                url: `/companies/search`,
                method: 'GET',
                params: {
                    searchTerm,
                },
            }),
            providesTags: ['Company']
        }),

        getCompaniesCount: builder.query<number, void>({
            query: () => ({
                url: `/companies/count`,
                method: 'GET',
            }),
            providesTags: ['Company']
        }),

        // Country Endpoints
        getCountries: builder.query<Country[], void>({
            query: () => ({
                url: `/countries`,
                method: 'GET'
            }),
            providesTags: ['Country']
        }),

        searchCountries: builder.query<Country[], string>({
            query: (searchTerm) => ({
                url: `/countries/search`,
                method: 'GET',
                params: { searchTerm }
            }),
            providesTags: ['Country']
        }),

        getCountryById: builder.query<Country, number>({
            query: (id) => ({
                url: `/countries/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Country', id }]
        }),

        // City Endpoints
        getCities: builder.query<City[], void>({
            query: () => ({
                url: `/cities`,
                method: 'GET'
            }),
            providesTags: ['City']
        }),

        getCitiesByCountry: builder.query<City[], number>({
            query: (countryId) => ({
                url: `/cities/country/${countryId}`,
                method: 'GET'
            }),
            providesTags: (result, error, countryId) => [{ type: 'City', id: countryId }]
        }),

        searchCities: builder.query<City[], string>({
            query: (searchTerm) => ({
                url: `/cities/search`,
                method: 'GET',
                params: { searchTerm }
            }),
            providesTags: ['City']
        }),

        getCityById: builder.query<City, number>({
            query: (id) => ({
                url: `/cities/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'City', id }]
        }),

        getCompaniesByManagerId: builder.query<Company[], number>({
            query: (managerId) => ({
                url: `/companies/manager/${managerId}`,
                method: 'GET'
            }),
            providesTags: (result, error, managerId) => [{ type: 'Company', id: managerId }]
        })
    }),
});

// Export hooks for usage in components
export const {
    useGetCompaniesQuery,
    useGetCompaniesWithPaginationQuery,
    useGetCompanyByIdQuery,
    useAddCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
    useGetCompaniesByTypeQuery,
    useSearchCompaniesQuery,
    useGetCompaniesCountQuery,
    useGetCountriesQuery,
    useSearchCountriesQuery,
    useGetCountryByIdQuery,
    useGetCitiesQuery,
    useGetCitiesByCountryQuery,
    useSearchCitiesQuery,
    useGetCityByIdQuery,
    useGetCompaniesByManagerIdQuery
} = companiesApi;