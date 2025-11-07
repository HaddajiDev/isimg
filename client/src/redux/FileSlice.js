import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';


const URL = "https://isimg-pre-back.onrender.com/api/data"
// const URL = `https://isimg-pre-back.vercel.app/api/data`
const LocalURL = 'http://localhost:5000/api/data'

axios.defaults.withCredentials = false;

export const getData = createAsyncThunk('data/get', async ({formData}, { rejectWithValue }) => {
  try {
    const result = await axios.post(`${URL}`, formData, {      
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return result.data;
  } catch (error) {
    console.error('Axios Error:', error.response?.data);
    return rejectWithValue(error.response?.data || error.message);
  }
});


export const getData_2 = createAsyncThunk('data/get', async ({formData}, { rejectWithValue }) => {
  try {
    const result = await axios.post(`${URL}/sem`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return result.data;
  } catch (error) {
    console.error('Axios Error:', error.response?.data);
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getDataPdf = createAsyncThunk('data/pdf', async ({formData, sem}, { rejectWithValue }) => {
  try {
    const result = await axios.post(`https://isimg-pre-back.vercel.app/api/data/pdf?sem=${sem}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return result.data;
  } catch (error) {
    console.error('Axios Error:', error.response?.data);
    return rejectWithValue(error.response?.data || error.message);
  }
});


export const getDataPdfLSIM2 = createAsyncThunk('data/pdflisim2', async ({formData, sem}, { rejectWithValue }) => {
  try {
    console.log(sem);
    const result = await axios.post(`https://isimg-pre-back.vercel.app/api/data/pdf/lsim2?sem=${sem}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return result.data;
  } catch (error) {
    console.error('Axios Error:', error.response?.data);
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
        .addCase(getDataPdfLSIM2.fulfilled, (state, action) => {
          state.data = action.payload.pdf;
        })

    }
});


export const { logout } = FileSlice.actions

export default FileSlice.reducer