import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => ({ message: "Kirbill API is running" }))
  .listen(3001);

console.log(`Server running at http://${app.server?.hostname}:${app.server?.port}`);
