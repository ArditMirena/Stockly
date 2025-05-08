import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from '../utils/axiosBaseQuery';

export interface User {
    id: number;
    username: string;
    usernameF: null | string;
    email: string;
    role: string;
}

interface PaginatedUserResponse {
    content: User[];
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

export const usersApi = createApi ({
    reducerPath: 'usersApi',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void> ({
            query: () => ({
                url: `/users`,
                method: 'GET'
            }),
        }),
        getUsersWithPagination: builder.query<PaginatedUserResponse, PaginationParams> ({
            query: (params) => ({
                url: `/users/page`,
                method: 'GET',
                params: {
                    offset: params?.offset || 0,
                    pageSize: params?.pageSize || 10,
                    sortBy: params?.sortBy || 'id',
                }
            })
        }),
        updateUser: builder.mutation<User, {id: number, user: Partial<User> }> ({
            query: ({id, ...user}) => ({
                url: `/users/${id}`,
                method: 'PUT',
                body: user
            })
        }),
        deleteUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE'
            })
        }),
        searchUsers: builder.query<User[], string | void>({
            query: (searchTerm = "") => ({
              url: `/users/search`,
              method: 'GET',
              params: {
                searchTerm,
              },
            }),
        })
    }),
});

export const {
    useGetUsersQuery,
    useGetUsersWithPaginationQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useSearchUsersQuery,
  } = usersApi;  