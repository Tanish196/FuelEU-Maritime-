import { Router, Request, Response } from "express";
import { RouteService } from "../../../core/application/RouteService.js";
import { RouteRepository } from "../../outbound/postgres/RouteRepository.js";
import { asyncHandler } from "../../../shared/middleware/errorHandler.js";

const router = Router();
const routeRepository = new RouteRepository();
const routeService = new RouteService(routeRepository);

// GET /routes
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const routes = await routeService.getAllRoutes();
    res.status(200).json({
        success: true,
        data: routes,
        count: routes.length
    });
}));

export default router;