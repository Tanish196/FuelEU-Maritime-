import type { Route } from "../domain/index.js";

export interface IRouteRepository{
    getAllRoutes(): Promise<Route[]>
}