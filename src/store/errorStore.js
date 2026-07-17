import {create} from "zustand";

export const useErrorStore = create((set) => ({
  isError: false,
  errorHeader:"",
  errorDescription: "",
  setError: (errorHeader, errorDescription) => {
    set({
      errorHeader:errorHeader,
      errorDescription: errorDescription,
      isError:true
    })  
  },
  clearError: () => {
    set({
    isError:false
    })
  }
}))

