import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../utils/axiosBaseQuery";

interface OrderItemDTO {
  id?: number;
  productId: number;
  quantity: number;
  productTitle?: string;
  productSku?: string;
  productThumbnail?: string;
  unitPrice?: number;
  totalPrice?: number;
}

export interface OrderDTO {
  id?: number;
  buyerId: number;
  supplierId: number;
  orderDate: string;
  deliveryDate: string;
  status: string;
  totalPrice: number;
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

interface PaginationParams {
  offset?: number;
  pageSize?: number;
  sortBy?: string;
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrders: builder.query<OrderDTO[], void>({
      query: () => ({
        url: '/orders',
        method: 'GET'
      }),
      transformResponse: (response: OrderDTO[] | { data: OrderDTO[] }) =>
        Array.isArray(response) ? response : response.data,
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Order' as const, id })), 'Order'] : ['Order'],
    }),
    getPaginatedOrders: builder.query<PaginatedOrderResponse, PaginationParams>({
      query: (params) => ({
        url: '/orders/page',
        method: 'GET',
        params: {
          offset: params?.offset || 0,
          pageSize: params?.pageSize || 10,
          sortBy: params?.sortBy || 'id'
        }
      }),
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<OrderDTO, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET'
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<OrderDTO, Partial<OrderDTO>>({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrder: builder.mutation<OrderDTO, { id: number, order: Partial<OrderDTO> }>({
      query: ({ id, order }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: order,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),
    updateOrderStatus: builder.mutation<void, { id: number, status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status/${status}`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => ['Order'],
    }),
    searchOrders: builder.query<OrderDTO[], string>({
      query: (searchTerm) => ({
        url: '/orders/search',
        method: 'GET',
        params: { searchTerm },
      }),
      transformResponse: (response: OrderDTO[] | { data: OrderDTO[] }) =>
        Array.isArray(response) ? response : response.data,
    }),
    verifyBuyer: builder.mutation<boolean, number>({
      query: (buyerId) => ({
        url: `/buyers/verify/${buyerId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetPaginatedOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useDeleteOrderMutation,
  useSearchOrdersQuery,
  useVerifyBuyerMutation,
} = ordersApi;