import './client.sass';
import {DataPacket, FramePacket, SizePacket} from "./types";
import {Size} from "opencv4nodejs";

let lastSize: Size;
let reconnecting: number;

function resizeFrame(size: Size, canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth * size.height / size.width;
    lastSize = {
        width: canvas.width,
        height: canvas.height,
    };
}

function drawFrame(image: string, context: CanvasRenderingContext2D) {
    const img = new Image();
    img.addEventListener('load', () => {
        context.drawImage(img, 0, 0, img.width, img.height, 0, 0, lastSize.width, lastSize.height);
    });
    img.src = image;
}

function isFramePacket(packet: DataPacket): packet is FramePacket {
    return packet.type === 'frame';
}

function isSizePacket(packet: DataPacket): packet is SizePacket {
    return packet.type === 'size';
}

function openCamera(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    const ws = new WebSocket(`ws://${window.location.host.split(":")[0]}:3001`);
    ws.addEventListener('open', () => {
        ws.send("open");
        if (reconnecting)
            clearInterval(reconnecting);
    });
    ws.addEventListener('error', (e) => {
        console.error(e);
    });
    ws.addEventListener('message', (message) => {
        const data = JSON.parse(message.data) as DataPacket;
        if (isSizePacket(data)) {
            resizeFrame(data.size, canvas);
        }
        else if (isFramePacket(data)) {
            const image = "data:image/jpg;base64," + data.frame;
            drawFrame(image, context);
        }
    });
    ws.addEventListener('close', () => {
        reconnecting = window.setTimeout(() => openCamera(canvas, context), 1000);
    })
}

(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
    if (!canvas)
        return;
    const context = canvas.getContext("2d");
    if (!context)
        return;
    lastSize = {
        width: canvas.width,
        height: canvas.height,
    };
    openCamera(canvas, context);
})();

