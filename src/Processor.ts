import {Camera} from "./Camera";
import * as WebSocket from "ws";
import * as cv from "opencv4nodejs";

export class Processor {
    private camera: Camera;
    private readonly server: WebSocket.Server;
    private readonly clients: { [time: string]: WebSocket } = {};


    private sendFrame(frame: cv.Mat) {
        const message = {
            type: "frame",
            frame: cv.imencode('.jpg', frame).toString('base64'),
            size: this.camera.frameSize,
        };
        const raw = JSON.stringify(message);
        Object.keys(this.clients).forEach(time => {
            const client = this.clients[time];
            if (client.readyState == 3)
                delete this.clients[time];
            if (client.readyState === 1)
                client.send(raw);
        });
    };

    constructor(port: string) {
        this.server = new WebSocket.Server({
            port: parseInt(port),
        });

        this.server.on('connection', ws => {
            const time = new Date().getTime();
            if (!this.camera) {
                this.camera = new Camera('../assets/20180919_194756.mp4');
                this.camera.on('frame', (frame: cv.Mat) => {
                    // console.log(frame);
                    // cv.imshow('s-gym', frame);
                    this.sendFrame(frame);
                });
            }
            this.clients[time] = ws;

            this.server.on('close', () => {
                delete this.clients[time];
                if (Object.keys(this.clients).length === 0)
                    this.camera.stop();
            });

            this.server.on('error', () => {
                delete this.clients[time];
                if (Object.keys(this.clients).length === 0)
                    this.camera.stop();
            })
        });
    }

// const writer = new cv.VideoWriter('../assets/video.mp4', camera.fourcc, camera.fps, camera.frameSize, true);
//  writer.release();

}