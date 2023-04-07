const factTexts = [
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

const factLength = (() => {
    let factLength = [];
    factTexts.forEach(text => factLength.push(text.length));
    return factLength;
})();

const redImage = (() => {
    let image = new Image();
    image.src = "red.png";
    return image;
})();

const greenImage = (() => {
    let image = new Image();
    image.src = "green.png";
    return image;
})();

const brainImage = (() => {
    let image = new Image();
    image.src = "brain.png";
    return image;
})();

const gameCanvas = document.getElementById("game-main-canvas");
const gameCanvasContext = gameCanvas.getContext("2d");
const maxTime = 45;
const maxLife = 5;
const cooldownTime = 2;
const updateRate = 60;
const objGenRate = 20;
const cnmcX = 400;
const cnmcY = 350;

function rotateCoor(x, y, r) {
    return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
}

function tranlateCoor(x, y, dx, dy) {
    return [x + dx, y + dy];
}

function scaleCoor(x, y, sx, sy) {
    return [x * sx, y * sy];
}

function pointInBeam(beamRotation, beamWidth, pointX, pointY) {
    let rotated = rotateCoor(pointX, pointY, -beamRotation);
    return ((0 < rotated[0]) && (-beamWidth / 2 <= rotated[1]) && (rotated[1] <= beamWidth / 2));
}

function drawLife(life) {
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

function drawTime(time) {
    gameCanvasContext.fillText("" + time, 400, 50);
}

function drawScore(score) {
    gameCanvasContext.fillText("" + score, 600, 50);
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

// Game state
let gameFactObjs = [];
let gameNegObjs = [];
let lastFrameClick = null;
let previousClicks = [];
let score = 0;
let life = maxLife;
let gameStarted = false;
let gameStartTime = Date.now();
let brainAngle = 0;
let beamX = 400;
let beamY = 750;

let lastGameEnd = null;

addEventListener("click", e => {
    if (e.button != 0)
        return;
    if (lastGameEnd && ((Date.now() - lastGameEnd) < cooldownTime * 1000))
        return;
    if (gameStarted)
        return;

    gameFactObjs = [];
    gameNegObjs = [];
    lastFrameClick = null;
    previousClicks = [];
    score = 0;
    life = maxLife;
    gameStartTime = Date.now();
    gameStarted = true;
    brainAngle = 0;

    let objGenIntervalHandle = setInterval(() => {
        // randomly spawn objects
        if (Math.random() < 0.5) {
            let newObject = [cnmcX, cnmcY, Math.random() * 2.0 * Math.PI, Math.floor(Math.random() * factTexts.length), 0, true];
            gameFactObjs.push(newObject);
        }

        if (Math.random() < 0.08) {
            let newObject = [cnmcX, cnmcY, Math.random() * 2.0 * Math.PI, Math.floor(Math.random() * factTexts.length), true];
            gameNegObjs.push(newObject);
        }
    }, 1000 / objGenRate);

    let frameIntervalHandle = setInterval(() => {
        // render everything
        {
            // clear everything
            gameCanvasContext.clearRect(0, 0, 800, 800);

            // draw texts
            gameCanvasContext.save();
            gameCanvasContext.strokeStyle = "rgb(255,30,20)";
            gameCanvasContext.fillStyle = "rgb(255,30,20)";
            gameCanvasContext.font = "30px monospace";
            gameCanvasContext.lineWdith = 3;
            gameFactObjs.forEach(factObj => {
                if (factObj[5]) {
                    gameCanvasContext.save();
                    gameCanvasContext.translate(factObj[0], factObj[1]);
                    // prevent text from being upside down
                    if (factObj[2] < Math.PI / 2 || Math.PI * 3 / 2 < factObj[2]) {
                        gameCanvasContext.rotate(-factObj[2]);
                        gameCanvasContext.fillText(factTexts[factObj[3]], 0, -factObj[4], 80);
                    } else {
                        gameCanvasContext.rotate(-(factObj[2] - Math.PI));
                        gameCanvasContext.fillText(factTexts[factObj[3]], -18 * factLength[factObj[3]] - 4, factObj[4] + 32, 80);
                    }
                    gameCanvasContext.restore();

                    gameCanvasContext.save();
                    gameCanvasContext.translate(factObj[0], factObj[1]);
                    gameCanvasContext.rotate(-factObj[2]);
                    gameCanvasContext.strokeRect(-2, -factObj[4] + 1, 18 * factLength[factObj[3]] + 4, -32);
                    gameCanvasContext.restore();
                }
            });
            gameCanvasContext.restore();

            // draw snacks
            gameCanvasContext.save();
            gameCanvasContext.strokeStyle = "rgb(20,255,60)";
            gameCanvasContext.lineWidth = 5;
            gameNegObjs.forEach(negObj => {
                if (negObj[4]) {
                    gameCanvasContext.save();
                    gameCanvasContext.translate(negObj[0], negObj[1]);
                    gameCanvasContext.scale(1 / 3, 1 / 3);
                    gameCanvasContext.rotate(-negObj[2]);
                    gameCanvasContext.drawImage(greenImage, 0, -negObj[3] * 3);
                    gameCanvasContext.strokeRect(0, -negObj[3] * 3 - 1, 200, 258);
                    gameCanvasContext.restore();
                }
            });
            gameCanvasContext.restore();

            // draw beams
            gameCanvasContext.save();
            gameCanvasContext.translate(beamX, beamY);
            previousClicks.forEach(click => {
                gameCanvasContext.save();
                gameCanvasContext.rotate(-click[0]);
                drawBeam((Date.now() - click[1]) / 250);
                gameCanvasContext.restore();
            });
            gameCanvasContext.restore();

            if (lastFrameClick) {
                gameCanvasContext.save();
                gameCanvasContext.translate(beamX, beamY);
                gameCanvasContext.rotate(-lastFrameClick[0])
                drawBeam(0);
                gameCanvasContext.restore();
                brainAngle = lastFrameClick[0];
            }

            // draw brain
            gameCanvasContext.save();
            gameCanvasContext.translate(beamX, beamY);
            gameCanvasContext.scale(0.5, 0.5);
            gameCanvasContext.rotate(-brainAngle + Math.PI / 2);
            gameCanvasContext.drawImage(brainImage, -100, -100);
            gameCanvasContext.restore();


            // draw everything else 
            gameCanvasContext.font = "30px monospace";
            gameCanvasContext.fillStyle = "rgb(20,30,30)";
            drawScore(score);
            drawTime((maxTime * 1000 - (Date.now() - gameStartTime)) / 1000);
            drawLife(life);
        }

        // update everything
        {
            // removed old objects
            while (gameFactObjs.length > 0 && (gameFactObjs[0][4] > 350)) {
                gameFactObjs.shift();
            }

            while (gameNegObjs.length > 0 && (gameNegObjs[0][3] > 350)) {
                gameNegObjs.shift();
            }

            while (previousClicks.length > 0 && (previousClicks[0][1] + 200 < Date.now())) {
                previousClicks.shift();
            }

            // move stuff
            gameFactObjs.forEach(factObj => {
                factObj[4] += 3 + Math.random() * 2;
            });

            gameNegObjs.forEach(negObj => {
                negObj[3] += 4 + Math.random() * 4;
            });

            // handle click
            if (lastFrameClick) {
                gameFactObjs.forEach(factObj => {
                    if (factObj[5]) {
                        let rectPoints = [
                            [-2, factObj[4] - 1],
                            [-2, 32 + factObj[4] - 1],
                            [-2 + 18 * factLength[factObj[3]] + 4, factObj[4] - 1],
                            [-2 + 18 * factLength[factObj[3]] + 4, 32 + factObj[4] - 1]
                        ];
                        rectPoints.forEach(point => {
                            if (factObj[5]) {
                                if (pointInBeam(lastFrameClick[0], 80, ...tranlateCoor(...rotateCoor(...point, factObj[2]), factObj[0] - beamX, beamY - factObj[1]))) {
                                    factObj[5] = false;
                                    score += 1;
                                }
                            }
                        });
                    }
                });

                gameNegObjs.forEach(negObj => {
                    if (negObj[4]) {
                        let rectPoints = [
                            [0, negObj[3]],
                            [0, negObj[3] - 258 / 3],
                            [0 + 200 / 3, negObj[3]],
                            [0 + 200 / 3, negObj[3] - 258 / 3],
                        ];
                        rectPoints.forEach(point => {
                            if (negObj[4]) {
                                if (pointInBeam(lastFrameClick[0], 80, ...tranlateCoor(...rotateCoor(...point, negObj[2]), negObj[0] - beamX, beamY - negObj[1]))) {
                                    negObj[4] = false;
                                    life -= 1;
                                }
                            }
                        });
                    }
                })

                previousClicks.push(lastFrameClick);
                lastFrameClick = null;
            }
        }

        // handle game end
        if (life <= 0 || maxTime * 1000 <= (Date.now() - gameStartTime)) {
            gameCanvasContext.clearRect(0, 0, 800, 800);
            drawScore(score);
            drawTime(maxTime * 1000 <= (Date.now() - gameStartTime) ? 0 : (maxTime * 1000 - (Date.now() - gameStartTime)) / 1000);
            drawLife(life);
            gameStarted = false;
            clearInterval(frameIntervalHandle);
            clearInterval(objGenIntervalHandle);
            lastGameEnd = Date.now();
            setTimeout(() => {
                gameCanvasContext.clearRect(0, 0, 600, 800);
            }, cooldownTime * 1000);
        }
    }, 1000 / updateRate);
})

addEventListener("click", e => {
    // register a click, overwrite previous click if both happened between a frame
    if (gameStarted)
        if (e.button == 0)
            lastFrameClick = [Math.atan2(-(e.clientY - beamY), e.clientX - beamX), Date.now(), false];
});
