import { Server } from "./index";

const app = new Server();
const addr = "127.0.0.1:3001";

app.use(async function(ctx) {
  const {req, res} = ctx;
  const headerData = req.getHeaders();
  res.body = `${JSON.stringify(headerData)}`;
});

app.listen(addr, function(){
  console.log(`listening on ${addr}`);
});