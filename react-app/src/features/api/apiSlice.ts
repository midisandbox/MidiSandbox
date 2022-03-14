// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REMOTE_FOLDER } from '../fileUpload/fileUploadSlice';

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_BASE_URL}`,
  }),
  // The "endpoints" represent operations and requests for this server
  endpoints: (builder) => ({
    // TODO: change any to expected return type
    getSheetMusic: builder.query<any, string>({
      query: (uuidFilename) => `${REMOTE_FOLDER.SHEET_MUSIC}/${uuidFilename}`,
    }),
  }),
});

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetSheetMusicQuery } = apiSlice;
