import express from "express";
import routesRouter from "../../adapters/inbound/http/routesRouter.js";
import bankingRouter from "../../adapters/inbound/http/bankingRouter.js";
import complianceRouter from "../../adapters/inbound/http/complianceRouter.js";
import { errorHandler } from "../../shared/middleware/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// API routes
app.use("/api/routes", routesRouter);
app.use("/api/banking", bankingRouter);
app.use("/api/compliance", complianceRouter);

// Error handler (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(Number(port), () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🏥 Health: http://localhost:${port}/health`);
    console.log(`📍 Routes: http://localhost:${port}/api/routes`);
    console.log(`💰 Banking: http://localhost:${port}/api/banking`);
    console.log(`📊 Compliance: http://localhost:${port}/api/compliance`);
});

export default app;
