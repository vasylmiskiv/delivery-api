import { Server } from "./server";

let server = new Server().app;
let port = 8080;
process.env.TZ = "Asia/Calcutta";

server.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
