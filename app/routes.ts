import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("learn/:algorithmId", "routes/learn.tsx"),
  route("references", "routes/references.tsx"),
  route("present", "routes/present.tsx"),
] satisfies RouteConfig;
