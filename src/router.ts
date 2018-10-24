import * as Koa from 'koa';
import * as fs from "fs-extra";
import * as Router from "koa-router";
import * as path from "path";

const router = new Router();

router.get('/', async ctx => {
    ctx.set('Content-Type', 'text/html');
    ctx.body = await fs.readFile(path.join(process.cwd(), '/assets/index.html'), 'utf-8');
});
router.get('/stream.mp4', video);

export async function video(ctx: Koa.Context) {
    ctx.body = fs.createReadStream(path.join(process.cwd(), 'assets/20180919_194756.mp4'));
}

export {router};

// const writer = new cv.VideoWriter('../assets/video.mp4', camera.fourcc, camera.fps, camera.frameSize, true);
//  writer.release();
