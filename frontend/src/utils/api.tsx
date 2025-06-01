import axios, { AxiosError, AxiosResponse } from "axios";

interface ErrorResponse {
  message: string;
  details?: any;
}

const api = axios.create({
  baseURL: "http://localhost:8081/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupResponseInterceptor = (onUnauthorized: () => void) => {
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ErrorResponse>) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error("Session expired. Logging out...");
            onUnauthorized();
            break;
          case 403:
            console.error("Access denied. You do not have permission.");
            break;
          case 404:
            console.error("Resource not found.");
            break;
          case 500:
            console.error("Internal server error.");
            break;
          default:
            console.error("An error occurred:", error.response.data.message);
        }
        return Promise.reject(error.response.data);
      } else if (error.request) {
        // Handle no response errors (e.g., network issues)
        console.error("No response received from the server.");
        return Promise.reject({ message: "No response received from the server." });
      } else {
        // Handle request setup errors
        console.error("Error in making request:", error.message);
        return Promise.reject({ message: error.message });
      }
    }
  );
};

export default api;
