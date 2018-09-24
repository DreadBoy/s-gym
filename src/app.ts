import * as Koa from 'koa';
import {router} from "./router";
import {Processor} from "./Processor";

const app = new Koa();

app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(parseInt(process.env.PORT || '3000'));

new Processor(process.env.WS_PORT || '3001');