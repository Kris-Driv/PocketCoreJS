let zoomPath = [];

const UI = {

    fpsCounter: null,
    fpsTracked: [],

    debugBarContainer: null,

    consoleContainer: null,
    messageList: null,
    addressInput: null,

    setup: () => {
        UI.fpsCounter = document.getElementById('fps-counter');

        UI.consoleContainer = document.getElementById('console-container');
        UI.messageList = document.getElementById('console-messages');
        UI.addressInput = document.getElementById('connection-input');

        let address = UI.addressInput.value;

        connectPocketCore(address, () => {
            document.getElementById('connection-light').classList.remove('bg-red-500');
            document.getElementById('connection-light').classList.add('bg-green-500');
        }, () => {
            document.getElementById('connection-light').classList.remove('bg-green-500');
            document.getElementById('connection-light').classList.add('bg-red-500');
        })
    },

    update: () => {
        // UI.fpsTracked.push(frameRate());
        // if (UI.fpsTracked.length > 60) UI.fpsTracked.shift();

        // let toShow = UI.fpsTracked.reduce((acc, curr) => acc + curr) / UI.fpsTracked.length;

        // UI.fpsCounter.innerHTML = "FPS: " + toShow.toFixed(1);

        // Player hover

        let hovering = [];
        players.forEach(player => {
            let coord = worldToCanvas(player.position.x, player.position.z, true);

            fill('blue');
            ellipse(coord[0], coord[1], 6, 6);

            if (dist(mouseX, mouseY, coord[0], coord[1]) < 18) hovering.push(player);
        });

        if (hovering.length > 0) {
            afterRender.push(() => {
                UI.renderPlayerCard(mouseX, mouseY, hovering);
            });
        }
    },

    log: (message) => {
        let messageElement = document.createElement('p');
        messageElement.classList.add('message-list__message');
        messageElement.innerHTML = message;

        UI.messageList.appendChild(messageElement);
        UI.messageList.scrollTop = UI.messageList.scrollHeight;
    },

    clearConsole: () => {
        UI.messageList.innerHTML = '';
    },

    renderPlayerCard: (x, y, players) => {
        let faceSize = 36;
        let padding = 8;
        let containerHeight = (faceSize + padding * 2);
        let count = players.length;

        players.forEach((player, i) => {

            let name = player.name ?? 'UNKNOWN';

            push();
            // Configure
            // y - (18 + containerHeight)
            translate(x + 18, y - (containerHeight + (18 - (i > 0 ? 10 : 0))) * i - containerHeight - 18);

            // Configure Text settings
            textAlign(LEFT);
            textSize(12);

            // Container Box
            stroke('#a1a1a1');
            fill('#121212');
            rect(0, 0, containerHeight + textWidth(name) + padding, faceSize + padding * 2);

            // Cool little arrow
            if (count === 1) {
                stroke('#a1a1a1');
                strokeWeight(2);
                line(-4, containerHeight - 4, -4, containerHeight + 4);
                line(-4, containerHeight + 4, 4, containerHeight + 4);
            }

            // Name
            strokeWeight(1);
            fill('#fff');
            text(name, faceSize + padding * 2, textSize() + padding);

            // Avatar
            noStroke();
            fill('pink');
            rect(padding, padding, faceSize, faceSize);

            if (player.face) {
                player.face.render(padding, padding, faceSize, faceSize);
            }

            pop();
        });
    },

    controlZoom: (event) => {

        let zoom = event.deltaY / 100;

        let before = canvasToWorld(width / 2, height / 2);

        let prevScl = renderer.scl;
        let newScl = max(0.5, min(prevScl + zoom, 5));

        renderer.scl = newScl;
        let after = canvasToWorld(width / 2, height / 2);

        let deltaX = before[0] - after[0];
        let deltaY = before[1] - after[1];

        // Let's get this delta to canvas coordinates
        let deltaCanvasX = deltaX * 2;
        let deltaCanvasY = deltaY * 2;

        renderer.offsetX -= deltaCanvasX / 2;
        renderer.offsetY -= deltaCanvasY / 2;



        let old = worldToCanvas(before[0], before[1], true);
        zoomPath.push(old);

        event.preventDefault();

        if (zoomPath.length > 20) zoomPath.shift();

        if (!showZoomPath) return;
        afterRender.push(() => {
            stroke('#fff');
            for (var i = zoomPath.length - 1; i >= 0; i--) {
                let last = zoomPath[i + 1];
                if (!last) continue;
                let curr = zoomPath[i];

                line(last[0], last[1], curr[0], curr[1]);
            }
        });
    }


}