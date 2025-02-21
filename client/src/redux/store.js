import { configureStore } from '@reduxjs/toolkit'
import FileSlice from './FileSlice'

export default configureStore({
  reducer: {
    file: FileSlice
  },
})