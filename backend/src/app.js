import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ limit: "20kb", extended: true }));
app.use(express.json());
app.use(express.static("public"));

// import router
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/products.routes.js";
import salesRouter from "./routes/sales.routes.js";
import purchaseOrdersRouter from "./routes/purchaseOrders.routes.js";
import financialRouter from "./routes/financialTransactions.routes.js";
import employeesRouter from "./routes/employees.routes.js";
import deliveriesRouter from "./routes/deliveries.routes.js";
import customerRouter from "./routes/customer.routes.js";
import invoiceRouter from "./routes/invoices.routes.js"

// router use
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/sales", salesRouter);
app.use("/api/v1/purchases", purchaseOrdersRouter);
app.use("/api/v1/financials", financialRouter);
app.use("/api/v1/employees", employeesRouter);
app.use("/api/v1/deliveries", deliveriesRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/invoices", invoiceRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export { app };
