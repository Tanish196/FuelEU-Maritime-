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

// POST /routes/:routeId/baseline - Set a route as the baseline
router.post("/:routeId/baseline", asyncHandler(async (req: Request, res: Response) => {
    const { routeId } = req.params;
    
    if (!routeId) {
        res.status(400).json({ 
            success: false, 
            message: "routeId parameter is required" 
        });
        return;
    }
    
    const updated = await routeService.setBaseline(routeId);
    res.status(200).json({ 
        success: true,
        message: "Baseline updated successfully", 
        data: updated 
    });
}));

export default router;