import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';

const URL = `https://isimg-pre-back.vercel.app/api/data`

export const getData = createAsyncThunk('data/get', async (formData) => {
    try {
      const result = await axios.post(`${URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return result.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  });


const initialState = {
    data: null,
}


export const FileSlice = createSlice({
    name: "file",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

        .addCase(getData.fulfilled, (state, action) => {
            state.data = action.payload.ai;
        })

    }
});


export const { logout } = FileSlice.actions

export default FileSlice.reducer