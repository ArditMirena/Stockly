import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../utils/axiosBaseQuery";

export interface ProductImage {
  imageUrl: string;
}

export interface ProductTag {
  id: number;
  name: string;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: Date;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  sku: string;
  weight: number;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  returnPolicy: string;
  minimumOrderQuantity: number;
  barcode: string;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl: string;
  categoryId: number;
  categoryName: string;
  dimensions: ProductDimensions;
  reviews: ProductReview[];
  images: ProductImage[];
  tags: ProductTag[];
}

interface PaginatedProductResponse {
    content: Product[];
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

export const productsApi = createApi ({
  reducerPath: 'productsApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
      getProducts: builder.query<Product[], void> ({
          query: () => ({
            url: `/products`,
            method: 'GET'
          }),
      }),
      getProductsWithPagination: builder.query<PaginatedProductResponse, PaginationParams>({
          query: (params) => ({
              url: '/products/page',
              method: 'GET',
              params: {
                  offset: params?.offset || 0,
                  pageSize: params?.pageSize || 10,
                  sortBy: params?.sortBy || 'id'
              }
          })
      }),
      getProductById: builder.query<Product, number> ({
          query: (id) => ({
            url: `/products/${id}`,
            method: 'GET'
          }),
      }),
      addProduct: builder.mutation<Product, Partial<Product>> ({
          query: (product) => ({
              url: `/products`,
              method: 'POST',
              body: product,
          }),
      }),
      updateProduct: builder.mutation<Product, {id: number, product: Partial<Product>}> ({
          query: ({id, ...product}) => ({
              url: `/products/${id}`,
              method: 'PUT',
              body: product,
          }),
      }),
      deleteProduct: builder.mutation<void, number> ({
          query: (id) => ({
              url: `/products/${id}`,
              method: 'DELETE',
          }),
      }),
      searchProducts: builder.query<Product[], string | void>({
          query: (searchTerm = "") => ({
            url: `/products/search`,
            method: 'GET',
            params: {
              searchTerm,
            },
          }),
      })
  }),
});

export const { 
  useGetProductsQuery,
  useGetProductsWithPaginationQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSearchProductsQuery
} = productsApi;