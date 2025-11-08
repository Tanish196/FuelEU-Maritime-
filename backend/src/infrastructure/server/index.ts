import express from "express";
import routesRouter from "../../adapters/inbound/http/routesRouter.js";
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

// Error handler (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(Number(port), () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🏥 Health: http://localhost:${port}/health`);
    console.log(`📍 Routes: http://localhost:${port}/api/routes`);
});

export default app;
