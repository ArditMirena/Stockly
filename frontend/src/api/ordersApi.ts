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
  id: number;
  buyerId: number;
  buyerName: string;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  orderDate: string;
  deliveryDate: string;
  status: string;
  shipmentId: string;
  totalPrice: number;
  items: OrderItemDTO[];
}

interface OrderItemRequest {
  productId: number;
  quantity: number;
}

interface CreateOrderRequest {
  warehouseId: number;
  buyerId: number;
  items: OrderItemRequest[];
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
    }),
    getOrdersWithPagination: builder.query<PaginatedOrderResponse, PaginationParams> ({
      query: (params) => ({
        url: `/orders/page`,
        method: 'GET',
        params: {
          offset: params?.offset || 0,
          pageSize: params?.pageSize || 10,
          sortBy: params?.sortBy || 'id'
        }
      })
    }),
    getOrderById: builder.query<OrderDTO, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET'
      }),
    }),
    createOrder: builder.mutation<OrderDTO, CreateOrderRequest>({
      query: (order) => ({
        url: '/orders/process',
        method: 'POST',
        data: order
      }),
    }),
    updateOrder: builder.mutation<OrderDTO, { id: number, order: Partial<OrderDTO> }>({
      query: ({ id, order }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: order,
      }),
    }),
    updateOrderStatus: builder.mutation<void, { id: number, status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status/${status}`,
        method: 'PATCH',
      }),
    }),
    cancelOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'PATCH',
      }),
    }),
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
    }),
    searchOrders: builder.query<OrderDTO[], string | void>({
      query: (searchTerm = "") => ({
        url: '/orders/search',
        method: 'GET',
        params: { searchTerm },
      }),
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
  useGetOrdersWithPaginationQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useDeleteOrderMutation,
  useSearchOrdersQuery,
  useVerifyBuyerMutation,
} = ordersApi;