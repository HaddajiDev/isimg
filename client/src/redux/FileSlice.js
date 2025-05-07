import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';

const api = axios.create({
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

const URL = `https://isimg-pre-back.vercel.app/api/data`;
//const URL = 'http://localhost:5000/api/data';

export const getData = createAsyncThunk('data/get', async ({formData, sem}, { rejectWithValue }) => {
  try {
    const result = await axios({
      method: 'post',
      url: `${URL}?sem=${sem}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: false
    });
    return result.data;
  } catch (error) {
    console.error('Axios Error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    }
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getDataPdf = createAsyncThunk('data/pdf', async ({formData, sem}, { rejectWithValue }) => {
  try {
    const result = await axios({
      method: 'post',
      url: `https://isimg-pre-back.vercel.app/api/data/pdf?sem=${sem}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: false
    });
    return result.data;
  } catch (error) {
    console.error('Axios Error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    }
    return rejectWithValue(error.response?.data || error.message);
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
        .addCase(getDataPdf.fulfilled, (state, action) => {
          state.data = action.payload.pdf;
        })
    }
});

export default FileSlice.reducer