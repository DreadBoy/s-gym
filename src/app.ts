import * as Koa from 'koa';
import {router} from "./router";
import {Processor} from "./Processor";
import * as serve from 'koa-static';
import * as path from "path";

const app = new Koa();

app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve(path.join(process.cwd(), 'public')))
    .listen(parseInt(process.env.PORT || '3000'));

new Processor(process.env.WS_PORT || '3001');