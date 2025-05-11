import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from '../utils/axiosBaseQuery';

export interface IShipment {
  id: string,
  trackingCode: string,
  status: string,
  labelUrl: string,
  rate: number,
  carrier: string,
  service: string
}

export interface ITracker {
  trackingCode: string,
  status: string,
  carrier: string,
  publicUrl: string
}

export const shipmentsApi = createApi ({
  reducerPath: 'shipmentsApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getShipmentById: builder.query<IShipment, string> ({
      query: (id) => ({
        url: `/shipments/${id}`,
        method: 'GET'
      })
    }),
    trackShipment: builder.query<ITracker, string> ({
      query: (trackId = "") => ({
        url: `/shipments/track`,
        method: 'GET',
        params: {
          trackId
        }
      })
    }),
    getShipmentByOrder: builder.query<IShipment, number> ({
      query: (orderId) => ({
        url: `/shipments/order`,
        method: `GET`,
        params: {
          orderId
        }
      })
    }),
    createShipment: builder.mutation<IShipment, number> ({
      query: (orderId) => ({
        url: `/shipments`,
        method: `POST`,
        body: orderId
      })
    }),
    deleteShipment: builder.mutation<void, string> ({
      query: (id) => ({
        url: `/shipments/${id}`,
        method: `DELETE`
      })
    })
  }),
});

export const {
  useGetShipmentByIdQuery,
  useTrackShipmentQuery,
  useGetShipmentByOrderQuery,
  useCreateShipmentMutation,
  useDeleteShipmentMutation
} = shipmentsApi;