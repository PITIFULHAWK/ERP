import express from "express";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware";
import cors from "cors";

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost:5173",
        ],
        credentials: true,
    })
);
app.use("/api/v1", routes);
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 ERP Server is running on port ${PORT}`);
    console.log(`📊 API Docs: http://localhost:${PORT}/api/v1/health`);
});
