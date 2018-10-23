import {Size} from "opencv4nodejs";

export type DataPacket = {
    type: string,
}

export type FramePacket = DataPacket  & {
    type: 'frame',
    frame: string,
}

export type SizePacket = DataPacket & {
    type: 'size',
    size: Size,
}