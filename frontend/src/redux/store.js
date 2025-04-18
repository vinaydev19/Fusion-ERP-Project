import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userSlice from "./userSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import productSlice from "./productSlice";
import saleSlice from "./saleSlice";
import financialSlice from "./financialSlice";
import employeeSlice from "./employeeSlice";
import deliverieSlice from "./deliverieSlice";
import customerSlice from "./customerSlice";
import invoiceSlice from "./invoiceSlice";
import purchaseSlice from "./purchaseSlice";

const persistConfig = {
  key: 'FusionERP',
  version: 1,
  storage,
  blacklist: ["products", "sales", "financial", "employee", "deliverie", "customers", "invoices", "purchases"]
}

const rootReducer = combineReducers({
  user: userSlice,
  product: productSlice,
  sale: saleSlice,
  financial: financialSlice,
  employee: employeeSlice,
  deliveries: deliverieSlice,
  customers: customerSlice,
  invoices: invoiceSlice,
  purchases: purchaseSlice
})
const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export default store;
