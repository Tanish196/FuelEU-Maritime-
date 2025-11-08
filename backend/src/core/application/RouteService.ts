import type { IRouteRepository } from "../ports/IRouteRepository.js";

export class RouteService {
    constructor(private routeRepository: IRouteRepository) { }

    async getAllRoutes() {
        return this.routeRepository.getAllRoutes()
    }
    async setBaseline(routeId: string) {
        return this.routeRepository.setBaseline(routeId);
    }
}