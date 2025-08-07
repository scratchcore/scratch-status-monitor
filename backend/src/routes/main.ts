import { Hono } from "hono";
import { docsRoute } from "./docs.js";
import { examplesWelcome } from "./welcome.js";

export const MainRoutes = new Hono();

MainRoutes.route("/", docsRoute);
MainRoutes.route("/", examplesWelcome);
