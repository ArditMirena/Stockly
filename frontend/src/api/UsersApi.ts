import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    credentials: 'include',
});

export interface Role {
    id: number;
    name: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    password?: string;
    usernameF?: string | null,
    role: Role;
    verificationCode?: string | null,
}

export const usersApi = createApi ({
    reducerPath: 'usersApi',
    baseQuery,
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void> ({
            query: () => `/users`,
        }),
        getCurrentUser: builder.query<User, void> ({
            query: () => `/users/me`,
        })
    }),
});

export const {
    useGetUsersQuery,
    useGetCurrentUserQuery
} = usersApi;