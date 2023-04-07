let factTexts = [
    "USB",
    "BSD",
    "SQL",
    "CTF",
    "IDE",
    "TCP",
    "UDP",
    "DNS",
    "HTML",
    "URL",
    "URI",
    "URN",
    "RFC",
    "HTTP",
    "CNMC",
    "SATA",
    "SSHD",
    "IPv4",
    "IPv6",
    "DDoS",
    "SSH",
    "SCP",
    "SUDO",
    "TLS",
    "WASD",
    "C++",
    "GREP",
    "GNU",
    "SED",
    "NaN"
];

let redImage = new Image();
redImage.src = "red.png";

let greenImage = new Image();
greenImage.src = "green.png";

let life = 5;
function drawLife(life) {
    const maxLife = 5;
    gameCanvasContext.save();
    gameCanvasContext.scale(0.2, 0.2);
    for (i = 0; i < maxLife; i++) {
        if (i < life) {
            gameCanvasContext.drawImage(greenImage, 0 + 240 * i, 0);
        } else {
            gameCanvasContext.drawImage(redImage, 0 + 240 * i, 0);
        }
    }
    gameCanvasContext.restore();
}

function drawBeam(decay) {
    function singleBeam() {
        gameCanvasContext.beginPath();
        gameCanvasContext.moveTo(0, 0);
        gameCanvasContext.lineTo(1000, 0);
        gameCanvasContext.stroke();
    }
    gameCanvasContext.lineCap = "round";
    gameCanvasContext.strokeStyle = "rgba(180,220,255," + (1 - decay) + ")";
    gameCanvasContext.lineWidth = 80;
    singleBeam();
    gameCanvasContext.strokeStyle = "rgba(180,220,255," + (1 - decay) + ")";
    gameCanvasContext.lineWidth = 60;
    singleBeam();
    gameCanvasContext.strokeStyle = "rgba(225,255,255," + (1 - decay) + ")";
    gameCanvasContext.lineWidth = 40;
    singleBeam();
    gameCanvasContext.strokeStyle = "rgba(255,255,255," + (1 - decay) + ")";
    gameCanvasContext.lineWidth = 20;
    singleBeam();
}

function pointInBeam(beamRotation, beamWidth, pointX, pointY) {
    // Beam: -width/2 <= y <= width/2
    console.log(beamRotation / 2 / Math.PI * 360)
    let transformedY = pointX * Math.sin(-beamRotation) + pointY * Math.cos(-beamRotation);
    if ((-beamWidth / 2 <= transformedY) && (transformedY <= beamWidth / 2)) {
        return true;
    } else {
        return false;
    }
}

function rotateCoor(x, y, r) {
    return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
}

function tranlateCoor(x, y, dx, dy) {
    return [x + dx, y + dy];
}

function scaleCoor(x, y, sx, sy) {
    return [x * sx, y * sy];
}

let factLength = []
factTexts.forEach(text => factLength.push(text.length));

let gameFactObjs = [];
let gameNegObjs = [];
let gameCanvas = document.getElementById("game-main-canvas");
let gameCanvasContext = gameCanvas.getContext("2d");
let lastFrameClick = null;
let previousClick = [];
let point = 0;

setInterval(() => {
    // Render Scene

    // Clear Everything
    gameCanvasContext.clearRect(0, 0, 800, 800);

    // Render Text Objects
    gameCanvasContext.save();
    gameCanvasContext.translate(400, 400);
    gameCanvasContext.strokeStyle = "rgb(255,30,20)";
    gameCanvasContext.lineWdith = 3;
    gameCanvasContext.font = "30px monospace";
    gameFactObjs.forEach(factObj => {
        if (factObj[5]) {
            gameCanvasContext.fillStyle = "rgb(255,30,20)";
            gameCanvasContext.save();
            // prevent text from fliping
            if (factObj[2] < Math.PI / 2 || Math.PI * 3 / 2 < factObj[2]) {
                gameCanvasContext.rotate(-factObj[2]);
                gameCanvasContext.fillText(factTexts[factObj[3]], 0, -factObj[4], 80);
            } else {
                gameCanvasContext.rotate(-(factObj[2] - Math.PI));
                gameCanvasContext.fillText(factTexts[factObj[3]], -18 * factLength[factObj[3]] - 4, factObj[4] + 32, 80);
            }
            gameCanvasContext.restore();

            gameCanvasContext.save();
            gameCanvasContext.rotate(-factObj[2]);
            gameCanvasContext.strokeRect(-2, -factObj[4] + 1, 18 * factLength[factObj[3]] + 4, -32);
            gameCanvasContext.restore();
        }
    });
    gameCanvasContext.restore();

    gameCanvasContext.save();
    gameCanvasContext.translate(400, 400);
    gameCanvasContext.scale(1/3, 1/3);
    gameNegObjs.forEach(negObj => {
        if(negObj[4]) {
            gameCanvasContext.strokeStyle = "rgb(20,255,60)";
            gameCanvasContext.lineWidth = 5;
            gameCanvasContext.save();
            gameCanvasContext.rotate(-negObj[2]);
            gameCanvasContext.drawImage(greenImage, 0, -negObj[3]*3);
            gameCanvasContext.restore();

            gameCanvasContext.save();
            gameCanvasContext.rotate(-negObj[2]);
            gameCanvasContext.strokeRect(0, -negObj[3]*3 - 1, 200, 258);
            gameCanvasContext.restore();

            let rectPoints = [
                [0, negObj[3]],
                [0, negObj[3] - 258 / 3],
                [0 + 200 / 3, negObj[3]],
                [0 + 200 / 3, negObj[3] - 258 / 3],
            ];
            gameCanvasContext.scale(3, 3);
            rectPoints.forEach(point => {
                // gameCanvasContext.fillRect(...tranlateCoor(...scaleCoor(...rotateCoor(...point, negObj[2]), 1, -1), 0, 0), 10, 10);
            });
            gameCanvasContext.scale(1/3, 1/3);
        }
    });
    gameCanvasContext.restore();

    gameCanvasContext.save();
    gameCanvasContext.translate(400, 800);
    while (previousClick.length > 0 && (previousClick[0][1] + 200 < Date.now())) {
        previousClick.shift();
    }
    previousClick.forEach(click => {
        gameCanvasContext.save();
        gameCanvasContext.rotate(-click[0]);
        drawBeam((Date.now() - click[1])/400);
        gameCanvasContext.restore();
    });
    if (lastFrameClick) {
        gameCanvasContext.save();
        gameCanvasContext.rotate(-lastFrameClick[0])
        drawBeam(0);
        previousClick.push(lastFrameClick);
        gameCanvasContext.restore();
        gameFactObjs.forEach(factObj => {
            if(factObj[5]) {
                let rectPoints = [
                    [-2, factObj[4] - 1],
                    [-2, 32 + factObj[4] - 1],
                    [-2 + 18 * factLength[factObj[3]] + 4, factObj[4] - 1],
                    [-2 + 18 * factLength[factObj[3]] + 4, 32 + factObj[4] - 1]
                ];
                rectPoints.forEach(point => {
                    if(pointInBeam(lastFrameClick[0], 80, ...tranlateCoor(...rotateCoor(...point, factObj[2]), 0, 400))) {
                        factObj[5] = false;
                        point += 1;
                    }
                });
            }
        });
        gameNegObjs.forEach(negObj => {
            if(negObj[4]) {
                let rectPoints = [
                    [0, negObj[3]],
                    [0, negObj[3] - 258 / 3],
                    [0 + 200 / 3, negObj[3]],
                    [0 + 200 / 3, negObj[3] - 258 / 3],
                ];
                rectPoints.forEach(point => {
                    if(pointInBeam(lastFrameClick[0], 80, ...tranlateCoor(...rotateCoor(...point, negObj[2]), 0, 400))) {
                        if(negObj[4]) {
                            negObj[4] = false;
                            life -= 1;
                        }
                    }
                });
            }
        })
        lastFrameClick = null;
    }
    gameCanvasContext.restore();
    drawLife(life);



    // Update Objects
    gameFactObjs.forEach(factObj => {
        factObj[4] += 3 + Math.random() * 2;
    });

    while (gameFactObjs.length > 0 && (gameFactObjs[0][4] > 500)) {
        gameFactObjs.shift();
    }

    gameNegObjs.forEach(negObj => {
        negObj[3] += 4 + Math.random() * 4;
    });

    while (gameNegObjs.length > 0 && (gameNegObjs[0][3] > 500)) {
        gameNegObjs.shift();
    }
    
}, 17);

setInterval(() => {
    if (Math.random() < 0.5) {
        let newObject = [400, 400, Math.random() * 2.0 * Math.PI, Math.floor(Math.random() * factTexts.length), 0, true];
        gameFactObjs.push(newObject);
    }

    if (Math.random() < 0.08) {
        let newObject = [400, 400, Math.random() * 2.0 * Math.PI, Math.floor(Math.random() * factTexts.length), true];
        gameNegObjs.push(newObject);
    }
    
}, 50);

addEventListener("click", e => {
    if (e.button == 0)
        lastFrameClick = [Math.atan2(-e.clientY + 800, e.clientX - 400), Date.now(), false];
});
