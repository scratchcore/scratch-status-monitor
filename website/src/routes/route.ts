import { Hono } from "hono";
import { RootPage } from "./root";
import { v1Routes } from "./v1/route";

export const MainRoutes = new Hono();

// Root: server-rendered page using React SSR helper
MainRoutes.route("/", RootPage);

// Mount API routes under /v1
MainRoutes.route("/v1", v1Routes);

