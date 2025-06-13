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
  sourceWarehouseId: number;
  destinationWarehouseId: number;
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
  sourceWarehouseId: number;
  buyerId: number;
  destinationWarehouseId: number;
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
  buyerManagerId?: number;
  supplierManagerId?: number;
  buyerCompanyId?: number;
  supplierCompanyId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  searchTerm?: string;
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
    getOrdersWithPagination: builder.query<PaginatedOrderResponse, PaginationParams>({
      query: (params) => ({
        url: `/orders/page`,
        method: 'GET',
        params: {
          offset: params?.offset || 0,
          pageSize: params?.pageSize || 10,
          sortBy: params?.sortBy || 'id',
          buyerManagerId: params?.buyerManagerId,
          supplierManagerId: params?.supplierManagerId,
          buyerCompanyId: params?.buyerCompanyId,
          supplierCompanyId: params?.supplierCompanyId,
          sourceWarehouseId: params?.sourceWarehouseId,
          destinationWarehouseId: params?.destinationWarehouseId,
          searchTerm: params?.searchTerm
        }
      }),
      providesTags: ['Order']
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
    verifyBuyer: builder.mutation<boolean, number>({
      query: (buyerId) => ({
        url: `/buyers/verify/${buyerId}`,
        method: 'GET',
      }),
    }),
    getOrdersCount: builder.query<number, void>({
      query: () => ({
        url: `/orders/count`,
        method: 'GET',
      }),
    })
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
  useVerifyBuyerMutation,
  useGetOrdersCountQuery
} = ordersApi;