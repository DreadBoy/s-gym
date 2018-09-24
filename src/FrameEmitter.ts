import {EventEmitter} from "events";
import * as cv from "opencv4nodejs";

export class FrameEmitter extends EventEmitter {
    private readonly capture: cv.VideoCapture;
    private readonly interval: NodeJS.Timer;
    private _done: boolean;
    public readonly fps: number;
    public readonly fourcc: number;
    public readonly frameSize: cv.Size;

    public get done(): boolean {
        return this._done;
    }

    constructor(filename: string) {
        super();
        this.capture = new cv.VideoCapture(filename);
        this.fps = this.capture.get(cv.CAP_PROP_FPS);
        this.fourcc = this.capture.get(cv.CAP_PROP_FOURCC);
        this.frameSize = new cv.Size(
            this.capture.get(cv.CAP_PROP_FRAME_WIDTH),
            this.capture.get(cv.CAP_PROP_FRAME_HEIGHT)
        );
        this._done = false;
        this.interval = setInterval(() => {
            let frame = this.capture.read();
            // loop back to start on end of stream reached
            if (frame.empty) {
                this.capture.reset();
                frame = this.capture.read();
            }
            this.emit('frame', frame);
            cv.waitKey(1);
        }, 0);
    }

    public stop() {
        this._done = true;
        this.capture.release();
        clearInterval(this.interval);
    }
}