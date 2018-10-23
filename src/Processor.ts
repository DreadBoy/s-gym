import {VideoSource} from "./VideoSource";
import * as WebSocket from "ws";
import * as cv from "opencv4nodejs";
import {DataPacket, FramePacket, SizePacket} from "./types";

export class Processor {
    private camera: VideoSource;
    private readonly server: WebSocket.Server;
    private readonly clients: { [time: string]: WebSocket } = {};

    private sendPacket(message: DataPacket) {
        const raw = JSON.stringify(message);
        Object.keys(this.clients).forEach(time => {
            const client = this.clients[time];
            if (client.readyState == 3)
                delete this.clients[time];
            if (client.readyState === 1)
                client.send(raw);
        });
    }

    private sendFrame(frame: cv.Mat) {
        const message: FramePacket = {
            type: "frame",
            frame: cv.imencode('.jpg', frame).toString('base64')
        };
        this.sendPacket(message);
    };

    private sendSize(size: cv.Size) {
        const message: SizePacket = {
            type: 'size',
            size,
        };
        this.sendPacket(message);
    }

    constructor(port: string) {
        this.server = new WebSocket.Server({
            port: parseInt(port),
        });

        this.server.on('connection', ws => {
            const time = process.uptime().toString();
            this.clients[time] = ws;
            if (!this.camera)
                this.camera = new VideoSource('../assets/20180919_194756.mp4');
            // this.camera = new VideoSource(0);
            this.camera.on('frame', (frame: cv.Mat) => {
                // console.log(frame);
                // cv.imshow('s-gym', frame);
                this.sendFrame(frame);
            });
            this.sendSize(this.camera.frameSize);

            this.server.on('message', () => {
            });

            this.server.on('close', () => {
                delete this.clients[time];
            });

            this.server.on('error', () => {
                delete this.clients[time];
            })
        });
    }

}