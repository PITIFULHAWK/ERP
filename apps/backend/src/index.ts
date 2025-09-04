import express from "express";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware";
const app = express();
const PORT = 5000;
app.use(express.json());

app.use("/api/v1", routes);
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`🚀 ERP Server is running on port ${PORT}`);
  console.log(`📊 API Docs: http://localhost:${PORT}/api/v1/health`);
});
