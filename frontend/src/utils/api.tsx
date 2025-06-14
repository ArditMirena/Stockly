import axios, { AxiosError, AxiosResponse } from "axios";

interface ErrorResponse {
  message: string;
  details?: any;
}

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // Only set JSON content type if it's not FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const setupResponseInterceptor = (onUnauthorized: () => void) => {
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => api(originalRequest))
            .catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const refreshResponse = await api.post("/auth/refresh");

          isRefreshing = false;
          processQueue(null, refreshResponse.data.accessToken);

          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);

          console.error("Refresh token invalid. Logging out...");
          onUnauthorized();
          return Promise.reject(refreshError);
        }
      }

      if (error.response) {
        switch (error.response.status) {
          case 403:
            console.error("Access denied.");
            break;
          case 404:
            console.error("Resource not found.");
            break;
          case 500:
            console.error("Internal server error.");
            break;
          default:
            console.error("Error:", error.response.data?.message || error.message);
        }
        return Promise.reject(error.response.data || { message: error.message });
      } else if (error.request) {
        console.error("No response from server.");
        return Promise.reject({ message: "No response received from the server." });
      } else {
        console.error("Request setup error:", error.message);
        return Promise.reject({ message: error.message });
      }
    }
  );
};

export const downloadReceiptWithAxios = async (orderId: number): Promise<Blob> => {
  const response = await api.get(`/receipts/${orderId}/download`, {
    responseType: 'blob',
    headers: {
      'Accept': 'application/pdf'
    },
  });

  return response.data;
};

export default api;
