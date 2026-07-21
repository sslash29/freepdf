import {create} from "zustand"

export const useToolbarStore = create((set) => ({
  tool:null,
  setTool: (toolName) => set({tool:toolName}) 
}))
