import './client.sass';


function drawFrame(image: string, context: CanvasRenderingContext2D) {
    const img = new Image();
    img.addEventListener('load', () => {
        context.drawImage(img, 0, 0);
    });
    img.src = image;
}

function openCamera(context: CanvasRenderingContext2D) {
    const ws = new WebSocket(`ws://${window.location.host.split(":")[0]}:3001`);
    ws.addEventListener('open', () => {
        ws.send("open");
    });
    ws.addEventListener('error', (e) => {
        console.error(e);
    });
    ws.addEventListener('message', (message) => {
        const data = JSON.parse(message.data);
        switch (data.type) {
            case "frame":
                const image = "data:image/jpg;base64," + data.frame;
                drawFrame(image, context);
                // console.log(data.size);
                break;
        }
    });
}

(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
    if (!canvas)
        return;
    const context = canvas.getContext("2d");
    if (!context)
        return;
    openCamera(context);
})();

