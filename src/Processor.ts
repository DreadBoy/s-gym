import {Camera} from "./Camera";
import * as WebSocket from "ws";
import * as cv from "opencv4nodejs";

export class Processor {
    private camera: Camera;
    private readonly server: WebSocket.Server;
    private readonly clients: { [time: number]: WebSocket } = {};

    constructor(port: string) {
        this.server = new WebSocket.Server({
            port: parseInt(port),
        });

        this.server.on('connection', ws => {
            const time = new Date().getTime();
            const sendFrame = (frame: cv.Mat) => {
                const message = {
                    type: "frame",
                    frame: cv.imencode('.jpg', frame).toString('base64')
                };
                const raw = JSON.stringify(message);
                Object.values(this.clients).forEach(client => client.send(raw));
            };
            if (!this.camera) {
                this.camera = new Camera('../assets/20180919_194756.mp4');
                this.camera.on('frame', (frame: cv.Mat) => {
                    // console.log(frame);
                    // cv.imshow('s-gym', frame);
                    sendFrame(frame);
                });
            }
            this.clients[time] = ws;

            this.server.on('close', () => {
                delete this.clients[time];
                if (Object.keys(this.clients).length === 0)
                    this.camera.stop();
            });
        });
    }
// const writer = new cv.VideoWriter('../assets/video.mp4', camera.fourcc, camera.fps, camera.frameSize, true);
//  writer.release();

}