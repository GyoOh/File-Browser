import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./FileSlice";
import { loadState, saveState } from "./LocalStorage";

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    fileSystem: fileReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  saveState(store.getState());
});

export default store;
