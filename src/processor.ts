import * as Koa from 'koa';
import * as fs from "fs-extra";
// import {FrameEmitter} from "./FrameEmitter";
// import * as cv from "opencv4nodejs";

export async function video(ctx: Koa.Context) {
    ctx.body = fs.createReadStream('../assets/20180919_194756.mp4');
}

// const emitter = new FrameEmitter('../assets/20180919_194756.mp4');
// const writer = new cv.VideoWriter('../assets/video.mp4', emitter.fourcc, emitter.fps, emitter.frameSize, true);
//
// emitter.on('frame', (frame: cv.Mat) => {
//     // console.log(frame);
//     cv.imshow('s-gym', frame);
//     writer.write(frame);
// });
// setTimeout(() => {
//     emitter.stop();
//     writer.release();
//     cv.destroyWindow('s-gym');
// }, 10000);
