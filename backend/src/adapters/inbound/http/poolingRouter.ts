import { Router, Request, Response } from "express";
import { PoolingService } from "../../../core/application/PoolingService.js";
import { PoolingRepository } from "../../outbound/postgres/PoolingRepository.js";
import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import { AppError } from "../../../shared/errors/AppError.js";

const router = Router();
const poolingRepository = new PoolingRepository();
const poolingService = new PoolingService(poolingRepository);

//  POST /api/pools
//  Create a pool with greedy allocation to redistribute CBs
router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        const { year, members } = req.body;

        // Validate request body
        if (!year || !members) {
            throw new AppError("Request body must include 'year' and 'members'", 400);
        }

        const result = await poolingService.createPool({ year, members });

        res.status(201).json(result);
    })
);

export default router;
