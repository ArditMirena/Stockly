import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from '../utils/axiosBaseQuery';

export interface RoleRequest {
  id: number;
  userId: number;
  role: string;
  approved: boolean;
}

interface PaginatedRoleRequestResponse {
    content: RoleRequest[];
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

export const roleRequestApi = createApi ({
    reducerPath: 'roleRequestApi',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        createRoleRequest: builder.mutation<RoleRequest, Partial<RoleRequest>> ({
            query: (body) => ({
                url: '/role-requests',
                method: 'POST',
                data: body,
            }),
        }),
        approveRoleRequest: builder.mutation<void, number> ({
            query: (id) => ({
                url: `/role-requests/${id}`,
                method: 'PUT'
            }),
        }),
        deleteRoleRequest: builder.mutation<void, number> ({
            query: (id) => ({
                url: `/role-requests/${id}`,
                method: 'DELETE',
            }),
        }),
        getRoleRequestsWithPagination: builder.query<PaginatedRoleRequestResponse, PaginationParams> ({
            query: (params) => ({
                url: '/role-requests/page',
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'id'
                },
            }),
        })
    })
});

export const {
    useCreateRoleRequestMutation,
    useApproveRoleRequestMutation,
    useDeleteRoleRequestMutation,
    useGetRoleRequestsWithPaginationQuery,
} = roleRequestApi;