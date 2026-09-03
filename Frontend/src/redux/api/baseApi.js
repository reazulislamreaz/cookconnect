import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://10.10.10.52:5050/v1",
  // baseUrl: "http://13.48.93.57:5003/v1",
  prepareHeaders: (headers, { getState }) => {
    headers.set("Accept", "application/json");

    // ✅ Get token from Redux store
    const token = getState().auth?.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  // credentials: "include", // Optional, if you want to send cookies
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQuery,
  tagTypes: ["user"],
  endpoints: () => ({}),
});
