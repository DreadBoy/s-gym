import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as fs from 'fs-extra';
import {video} from "./processor";

const app = new Koa();
const router = new Router();

router.get('/', async ctx => {
    ctx.set('Content-Type', 'text/html');
    ctx.body = await fs.readFile('../assets/index.html', 'utf-8');
});
router.get('/stream.mp4', video);

app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(process.env.PORT || 3000);