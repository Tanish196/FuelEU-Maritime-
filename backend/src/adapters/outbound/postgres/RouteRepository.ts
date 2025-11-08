import type { Route } from "../../../core/domain/index.js";
import type { IRouteRepository } from "../../../core/ports/IRouteRepository.js";
import prisma from "../../../infrastructure/db/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class RouteRepository implements IRouteRepository {
    async getAllRoutes(): Promise<Route[]> {
        try {
            const routes = await prisma.route.findMany({
                select: {
                    id: true,
                    route_id: true,
                    vesselType: true,
                    fuelType: true,
                    year: true,
                    ghg_intensity: true,
                    fuelConsumption: true,
                    distance: true,
                    totalEmissions: true,
                    is_baseline: true,
                },
            });

            return routes.map((r: any): Route => ({
                id: r.id,
                routeId: r.route_id,
                vesselType: r.vesselType,
                fuelType: r.fuelType,
                year: r.year,
                ghgIntensity: r.ghg_intensity,
                fuelConsumption: r.fuelConsumption,
                distance: r.distance,
                totalEmissions: r.totalEmissions,
                isBaseline: r.is_baseline,
            }));
        } catch (error) {
            throw new AppError(
                `Failed to fetch routes: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }
}