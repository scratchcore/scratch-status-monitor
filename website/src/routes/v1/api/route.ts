import { Hono } from "hono";
import { statusRoute } from "./status";

export const apiRoutes = new Hono();

apiRoutes.route("/status", statusRoute);
