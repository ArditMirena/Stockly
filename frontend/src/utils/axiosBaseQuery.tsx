import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import api from './api';

export const axiosBaseQuery =
    (): BaseQueryFn<
        {
            url: string;
            method: AxiosRequestConfig['method'];
            data?: AxiosRequestConfig['data'];
            params?: AxiosRequestConfig['params'];
            headers?: AxiosRequestConfig['headers'];
            responseType?: AxiosRequestConfig['responseType']; // <-- ADD THIS
        },
        unknown,
        unknown
    > =>
        async ({ url, method, data, params, headers, responseType }) => {
            try {
                const config: AxiosRequestConfig = {
                    url,
                    method,
                    data,
                    params,
                    headers: data instanceof FormData ? undefined : headers,
                    responseType // <-- PASS IT TO AXIOS
                };

                const result = await api(config);
                return { data: result.data };
            } catch (axiosError) {
                const err = axiosError as AxiosError;
                return {
                    error: {
                        status: err.response?.status || 500,
                        data: err.response?.data || err.message,
                    },
                };
            }
        };
