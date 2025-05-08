import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import { User } from '../api/UsersApi';

const token: string | null = Cookies.get('token') || null;

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export interface SignupData {
  username: string;
  email: string;
  password: string;
};

export interface LoginData {
  email: string;
  password: string;
};

export interface VerifyUserData {
  email: string;
  verificationCode: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | { message: string; details?: any } | null;
};

const initialState: AuthState = {
  user: null,
  token: isTokenExpired(token) ? null : token,
  isLoading: false,
  error: null,
};

export const signup = createAsyncThunk('auth/signup', async (userData: SignupData, { rejectWithValue }) => {
  try {
    const response = await api.post(`/auth/signup`, userData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const login = createAsyncThunk('auth/login', async (credentials: LoginData, { rejectWithValue }) => {
  try {
    const response = await api.post(`/auth/login`, credentials);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const verify = createAsyncThunk('auth/verify', async (verifyUserData: VerifyUserData, { rejectWithValue }) => {
  try {
    const response = await api.post(`/auth/verify`, verifyUserData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const fetchCurrentUser = createAsyncThunk('users/me', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Unable to fetch user info');
  }
});

export const logoutAsync = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post(`/auth/logout`);
    return true;
  } catch (error: any) {
    return rejectWithValue('Logout failed.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.error = null;
        state.user = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verify.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verify.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verify.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.error = action.payload as string;
      })      
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
