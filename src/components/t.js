import { useEffect, useRef } from "react";
import styles from "./Board.module.css";

const balls = [], speed = 2, levelarr = [], time = 250, colors = ['lightgreen', 'red'], players = {}, pop = new Audio('/sfx-pop (mp3cut.net).mp3');

let player = 0, boxes, dimension, radius;

class Ball {
    constructor(c, player, x, y) {
        this.c = c;
        this.player = player;
        this.x = x;
        this.y = y;
        this.newX = x;
        this.newY = y;
    };

    draw() {
        this.c.clearRect(this.x - radius - 2, this.y - radius - 2, radius * 2 + 4, radius * 2 + 4);
        this.c.beginPath();
        this.c.arc(this.x, this.y, radius, 0, Math.PI * 2);
        this.c.fillStyle = colors[this.player];
        this.c.stroke();
        this.c.fill();
        this.c.closePath();
    };

    async update() {
        if (((this.x - this.newX) > 0 ? (this.x - this.newX) : (this.newX - this.x)) < speed && ((this.y - this.newY) > 0 ? (this.y - this.newY) : (this.newY - this.y)) < speed) return;

        if (this.x < this.newX) this.x += speed;
        if (this.x > this.newX) this.x -= speed;
        if (this.y < this.newY) this.y += speed;
        if (this.y > this.newY) this.y -= speed;

        this.draw();

        await new Promise(resolve => setTimeout(resolve, 0));

        this.update();

        // VERY <IMPORTANT></IMPORTANT>
        // dont write like setTimeout(this.update, (speed * 1000) / dimension);
        // because the this value will change and aon next return, this will refer to something else, not the class

        // can write like setTimeout(this.update.bind(this), (speed * 1000) / dimension);
        // or define the main function update itself as arrow function
    };

    set(direction) {
        this.x = this.newX;
        this.y = this.newY;
        this.c.clearRect(this.x - dimension, this.y - dimension, dimension * 2, dimension * 2);

        switch (direction) {
            case 'U': {
                this.newY -= dimension * 2;
                break;
            }
            case 'R': {
                this.newX += dimension * 2;
                break;
            }
            case 'D': {
                this.newY += dimension * 2;
                break;
            }
            default: this.newX -= dimension * 2;
        }

        this.update();
    };

    changePlayer() {
        this.player = player;
    };

    move(number, pos) {
        this.x = this.newX;
        this.y = this.newY;

        if (number === 1) this.c.clearRect(this.x - dimension, this.y - dimension, dimension * 2, dimension * 2);
        else if (number === 2) {
            if (pos === 0) {
                this.c.clearRect(this.x - dimension, this.y - dimension, dimension * 2, dimension * 2);
                this.x -= dimension / 2;
            }
            else this.x += dimension / 2;
        }
        else {
            if (pos === 0) {
                this.c.clearRect(this.x - dimension, this.y - dimension, dimension * 2, dimension * 2);
                this.x -= dimension / 2;
                this.y += dimension / 2;
            }
            else if (pos === 1) {
                this.x -= dimension / 2;
                this.y -= dimension / 2;
            }
            else this.x += dimension / 2;
        }

        this.draw();
        setTimeout(() => this.draw(), time);
    };
};

class Queue {
    constructor(balls) {
        this.balls = balls;
        this.children = [];
    };

    add(child) {
        this.children.push(child);
    };
};

for (let i = 0; i < 4; i++) {
    balls.push([]);

    for (let j = 0; j < 4; j++) {
        balls[i].push([]);
    }
}

function setlevelarr(row, col) {
    levelarr.length = 0;

    for (let i = 0; i < balls.length; i++) {
        levelarr.push([]);

        for (let j = 0; j < balls[0].length; j++) {
            levelarr[i].push(i === row && j === col ? 0 : undefined);
        }
    }
};

// function printarr(arr) {
//     const a = [];

//     for (let i = 0; i < arr.length; i++) {
//         a.push([]);

//         for (let j = 0; j < arr[0].length; j++) {
//             // a[i].push(arr[i][j]);
//             a[i].push(arr[i][j].length > 0 ? [...arr[i][j]] : []);
//         }
//     }

//     return a;
// };

async function animate(queue) {
    if (!queue) return;

    let queues = [queue];

    do {
        queues.forEach(queue => {
            let count = 0;

            queue.balls.forEach((element, index) => {
                if (element.dir !== 'O') {
                    if (index === 0) pop.play();

                    element.ball.set(element.dir);
                    count++;
                }
                else element.ball.move(queue.balls.length - count, index - count);
            });
        });

        await new Promise(yay => setTimeout(yay, time));

        let newqueues = [];

        queues.forEach(queue => newqueues = newqueues.concat(queue.children));
        queues = newqueues;
    } while (queues.length !== 0);
};

function positionCheck(row, col, compare) {
    if (row === 0 || row === balls.length) {
        if (col === 0 || col === balls[0].length - 1) return balls[row][col].length > 1 && levelarr[row][col] < compare;
        else return balls[row][col].length > 2 && levelarr[row][col] < compare;
    }
    else if (col === 0 || col === balls[0].length - 1) return balls[row][col].length > 2 && levelarr[row][col] < compare;
    else return balls[row][col].length > 3 && levelarr[row][col] < compare;
};
var a=1;
function check(row, col) {
    if(a++>=1000)
    return;
    const ballarr = balls[row][col];

    if (ballarr.length === 1) return;

    ballarr.forEach(ball => ball.changePlayer());

    let queue;

    if (row === 0 && col === 0) {
        if (positionCheck(row, col + 1, levelarr[row][col]) || positionCheck(row + 1, col, levelarr[row][col])) return;

        if (ballarr.length === 2) queue = new Queue([{ ball: ballarr[0], dir: 'R' }, { ball: ballarr[1], dir: 'D' }])
        else queue = new Queue([{ ball: ballarr[0], dir: 'R' }, { ball: ballarr[1], dir: 'D' }, { ball: ballarr[2], dir: 'O' }]);

        balls[row][col + 1].push(ballarr[0]);
        balls[row + 1][col].push(ballarr[1]);
        balls[row][col].splice(0, 2);

        if (levelarr[row][col + 1] === undefined) levelarr[row][col + 1] = levelarr[row][col] + 1;
        if (levelarr[row + 1][col] === undefined) levelarr[row + 1][col] = levelarr[row][col] + 1;

        const a1 = check(row, col + 1), a2 = check(row + 1, col);

        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
    }
    else if (row === 0 && col === balls[0].length - 1) {
        if (positionCheck(row, col - 1, levelarr[row][col]) || positionCheck(row + 1, col, levelarr[row][col])) return;

        if (ballarr.length === 2) queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'D' }]);
        else queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'D' }, { ball: ballarr[2], dir: 'O' }]);

        balls[row][col - 1].push(ballarr[0]);
        balls[row + 1][col].push(ballarr[1]);
        balls[row][col].splice(0, 2);

        if (levelarr[row][col - 1] === undefined) levelarr[row][col - 1] = levelarr[row][col] + 1;
        if (levelarr[row + 1][col] === undefined) levelarr[row + 1][col] = levelarr[row][col] + 1;

        const a1 = check(row, col - 1), a2 = check(row + 1, col);

        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
    }
    else if (row === 0 && ballarr.length >= 3) {
        if (positionCheck(row, col - 1, levelarr[row][col]) || positionCheck(row + 1, col, levelarr[row][col]) || positionCheck(row, col + 1, levelarr[row][col])) return;

        if (ballarr.length === 3) queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'D' }, { ball: ballarr[2], dir: 'R' }]);
        else if (ballarr.length === 4) queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'D' }, { ball: ballarr[2], dir: 'R' }, { ball: ballarr[3], dir: 'O' }]);
        else queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'D' }, { ball: ballarr[2], dir: 'R' }, { ball: ballarr[3], dir: 'O' }, { ball: ballarr[4], dir: 'O' }]);

        balls[row][col - 1].push(ballarr[0]);
        balls[row + 1][col].push(ballarr[1]);
        balls[row][col + 1].push(ballarr[2]);
        balls[row][col].splice(0, 3);

        if (levelarr[row][col - 1] === undefined) levelarr[row][col - 1] = levelarr[row][col] + 1;
        if (levelarr[row + 1][col] === undefined) levelarr[row + 1][col] = levelarr[row][col] + 1;
        if (levelarr[row][col + 1] === undefined) levelarr[row][col + 1] = levelarr[row][col] + 1;

        const a1 = check(row, col - 1), a2 = check(row + 1, col), a3 = check(row, col + 1);

        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
        if (a3) queue.add(a3);
    }
    else if (row === balls.length - 1 && col === 0) {
        if (positionCheck(row, col + 1, levelarr[row][col]) || positionCheck(row - 1, col, levelarr[row][col])) return;

        if (ballarr.length === 2) queue = new Queue([{ ball: ballarr[0], dir: 'R' }, { ball: ballarr[1], dir: 'U' }]);
        else queue = new Queue([{ ball: ballarr[0], dir: 'R' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'O' }]);

        balls[row][col + 1].push(ballarr[0]);
        balls[row - 1][col].push(ballarr[1]);
        balls[row][col].splice(0, 2);

        if (levelarr[row - 1][col] === undefined) levelarr[row - 1][col] = levelarr[row][col] + 1;
        if (levelarr[row][col + 1] === undefined) levelarr[row][col + 1] = levelarr[row][col] + 1;

        const a1 = check(row, col + 1), a2 = check(row - 1, col);

        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
    }
    else if (row === balls.length - 1 && col === balls[0].length - 1) {
        if (positionCheck(row, col - 1, levelarr[row][col]) || positionCheck(row - 1, col, levelarr[row][col])) return;

        if (ballarr.length === 2) queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'U' }]);
        else queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'O' }]);

        balls[row][col - 1].push(ballarr[0]);
        balls[row - 1][col].push(ballarr[1]);
        balls[row][col].splice(0, 2);

        if (levelarr[row - 1][col] === undefined) levelarr[row - 1][col] = levelarr[row][col] + 1;
        if (levelarr[row][col - 1] === undefined) levelarr[row][col - 1] = levelarr[row][col] + 1;

        const a1 = check(row, col - 1), a2 = check(row - 1, col);

        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
    }
    else if (row === balls.length - 1 && ballarr.length >= 3) {
        if (positionCheck(row, col - 1, levelarr[row][col]) || positionCheck(row - 1, col, levelarr[row][col]) || positionCheck(row, col + 1, levelarr[row][col])) return;

        if (ballarr.length === 3) queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'R' }]);
        else if (ballarr.length === 4) queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'R' }, { ball: ballarr[3], dir: 'O' }]);
        else queue = new Queue([{ ball: ballarr[0], dir: 'L' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'R' }, { ball: ballarr[3], dir: 'O' }, { ball: ballarr[4], dir: 'O' }]);

        balls[row][col - 1].push(ballarr[0]);
        balls[row - 1][col].push(ballarr[1]);
        balls[row][col + 1].push(ballarr[2]);
        balls[row][col].splice(0, 3);

        if (levelarr[row - 1][col] === undefined) levelarr[row - 1][col] = levelarr[row][col] + 1;
        if (levelarr[row][col + 1] === undefined) levelarr[row][col + 1] = levelarr[row][col] + 1;
        if (levelarr[row][col - 1] === undefined) levelarr[row][col - 1] = levelarr[row][col] + 1;

        const a1 = check(row, col - 1), a2 = check(row - 1, col), a3 = check(row, col + 1);

        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
        if (a3) queue.add(a3);
    }
    else if (col === 0 && ballarr.length >= 3) {
        if (positionCheck(row - 1, col, levelarr[row][col]) || positionCheck(row + 1, col, levelarr[row][col]) || positionCheck(row, col + 1, levelarr[row][col])) return;
        // console.log(printarr(balls))
        
        if (ballarr.length === 3) queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'R' }]);
        else if (ballarr.length === 4) queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'R' }, { ball: ballarr[3], dir: 'O' }]);
        else queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'R' }, { ball: ballarr[3], dir: 'O' }, { ball: ballarr[4], dir: 'O' }]);


        balls[row + 1][col].push(ballarr[0]);
        balls[row - 1][col].push(ballarr[1]);
        balls[row][col + 1].push(ballarr[2]);
        balls[row][col].splice(0, 3);

        if (levelarr[row - 1][col] === undefined) levelarr[row - 1][col] = levelarr[row][col] + 1;
        if (levelarr[row][col + 1] === undefined) levelarr[row][col + 1] = levelarr[row][col] + 1;
        if (levelarr[row + 1][col] === undefined) levelarr[row + 1][col] = levelarr[row][col] + 1;

        const a1 = check(row + 1, col), a2 = check(row - 1, col), a3 = check(row, col + 1);

        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
        if (a3) queue.add(a3);
    }
    else if (col === balls[0].length - 1 && ballarr.length >= 3) {
        if (positionCheck(row - 1, col, levelarr[row][col]) || positionCheck(row + 1, col, levelarr[row][col]) || positionCheck(row, col - 1, levelarr[row][col])) return;

        if (ballarr.length === 3) queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'L' }]);
        else if (ballarr.length === 4) queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'L' }, { ball: ballarr[3], dir: 'O' }]);
        else queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'L' }, { ball: ballarr[3], dir: 'O' }, { ball: ballarr[4], dir: 'O' }]);

        balls[row + 1][col].push(ballarr[0]);
        balls[row - 1][col].push(ballarr[1]);
        balls[row][col - 1].push(ballarr[2]);
        balls[row][col].splice(0, 3);

        if (levelarr[row - 1][col] === undefined) levelarr[row - 1][col] = levelarr[row][col] + 1;
        if (levelarr[row][col - 1] === undefined) levelarr[row][col - 1] = levelarr[row][col] + 1;
        if (levelarr[row + 1][col] === undefined) levelarr[row + 1][col] = levelarr[row][col] + 1;

        const a1 = check(row + 1, col), a2 = check(row - 1, col), a3 = check(row, col - 1);

        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
        if (a3) queue.add(a3);
    }
    else if (ballarr.length >= 4) {
        if (positionCheck(row - 1, col, levelarr[row][col]) || positionCheck(row + 1, col, levelarr[row][col]) || positionCheck(row, col + 1, levelarr[row][col]) || positionCheck(row, col - 1, levelarr[row][col])) return;

        if (ballarr.length === 4) queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'L' }, { ball: ballarr[3], dir: 'R' }]);
        else if (ballarr.length === 5) queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'L' }, { ball: ballarr[3], dir: 'R' }, { ball: ballarr[4], dir: 'O' }]);
        else if (ballarr.length === 6) queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'L' }, { ball: ballarr[3], dir: 'R' }, { ball: ballarr[4], dir: 'O' }, { ball: ballarr[5], dir: 'O' }]);
        else queue = new Queue([{ ball: ballarr[0], dir: 'D' }, { ball: ballarr[1], dir: 'U' }, { ball: ballarr[2], dir: 'L' }, { ball: ballarr[3], dir: 'R' }, { ball: ballarr[4], dir: 'O' }, { ball: ballarr[5], dir: 'O' }, { ball: ballarr[6], dir: 'O' }]);

        balls[row + 1][col].push(ballarr[0]);
        balls[row - 1][col].push(ballarr[1]);
        balls[row][col - 1].push(ballarr[2]);
        balls[row][col + 1].push(ballarr[3]);
        balls[row][col].splice(0, 4);

        if (levelarr[row - 1][col] === undefined) levelarr[row - 1][col] = levelarr[row][col] + 1;
        if (levelarr[row][col + 1] === undefined) levelarr[row][col + 1] = levelarr[row][col] + 1;
        if (levelarr[row][col - 1] === undefined) levelarr[row][col - 1] = levelarr[row][col] + 1;
        if (levelarr[row + 1][col] === undefined) levelarr[row + 1][col] = levelarr[row][col] + 1;

        const a1 = check(row + 1, col), a2 = check(row - 1, col), a3 = check(row, col - 1), a4 = check(row, col + 1);
        
        if (a1) queue.add(a1);
        if (a2) queue.add(a2);
        if (a3) queue.add(a3);
        if (a4) queue.add(a4);
    }
    else {
        const arr = [];
        
        ballarr.forEach(ball => arr.push({ ball, dir: 'O' }));
        
        queue = new Queue(arr);
    }

    return queue;
};

function Ler(props) {
    const canvas = useRef();
    const context = useRef();

    useEffect(() => {
        boxes = document.querySelectorAll(`.${styles.box}`);
        dimension = parseInt(getComputedStyle(boxes[0]).width) / 2;
        radius = dimension * 0.3;

        context.current = canvas.current.getContext('2d');

        canvas.current.width = 400;
        canvas.current.height = 400;
    }, []);

    async function addBall(e) {
        const index = e.target.getAttribute('data-pos'), col = index % 4, row = Math.floor(index / 4);

        if (balls[row][col].length !== 0 && balls[row][col][0].player !== player) return;

        const ball = new Ball(context.current, player, (canvas.current.width / 4) * col + dimension, (canvas.current.width / 4) * row + dimension);

        balls[row][col].push(ball);
        ball.draw();

        if (!players[player]) players[player] = 1;
        else players[player]++;

        await pop.play();
        setlevelarr(row, col);
        await animate(check(row, col));

        if (++player === 2) player = 0;

        boxes.forEach(box => box.style.borderColor = colors[player]);
    };

    return (
        <div className={styles.board}>
            <canvas ref={canvas} />
            {Array(16).fill(0).map((element, index) => <div className={styles.box} onClick={addBall} data-pos={index} key={index} />)}
        </div>
    );
};

export default Ler;