import {VideoSource} from "./VideoSource";
import * as WebSocket from "ws";
import * as cv from "opencv4nodejs";
import {DataPacket, FramePacket, SizePacket} from "./types";
import * as path from "path";

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

        const blurMatrix: cv.Size = new cv.Size(3, 3);
        // const scaleFactor = 0.5;
        const red = new cv.Vec3(0, 0, 255);

        this.server.on('connection', ws => {
            const time = process.uptime().toString();
            const filename = path.join(process.cwd(), 'assets/20180919_194756.mp4');
            this.clients[time] = ws;
            if (!this.camera)
                this.camera = new VideoSource(filename);
            // this.camera = new VideoSource(0);
            this.camera.on('frame', async (frame: cv.Mat) => {
                // console.log(frame);
                // cv.imshow('s-gym', frame);
                try {
                    // let original = frame.resize(this.camera.frameSize.height * scaleFactor, this.camera.frameSize.width * scaleFactor);
                    let copy = frame
                        .copy()
                        .blur(blurMatrix)
                        .bgrToGray()
                        // .adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 7, 4)
                        .canny(50, 100)
                        // erode, then dilate
                        .bitwiseNot()
                    ;
                    let contours = copy.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
                    contours.sort((a, b) => b.area - a.area);
                    // copy = copy.cvtColor(cv.COLOR_GRAY2RGB);
                    contours
                        .slice(1, 300)
                        .forEach(c => {
                            frame.drawRectangle(c.boundingRect(), red);
                        })
                    ;
                    this.sendFrame(frame);
                }
                catch (e) {
                    debugger;
                }
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