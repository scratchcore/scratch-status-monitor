import { Hono } from "hono";
import { apiRoutes } from "./api/route";

export const v1Routes = new Hono();

v1Routes.route("/api", apiRoutes);
