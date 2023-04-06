import { useCallback, useEffect, useRef } from "react";
import styles from "./Board.module.css";

class Ball {
    constructor(dimension, c, player, color, x, y) {
        this.dimension = dimension;
        this.c = c;
        this.player = player;
        this.color = color;
        this.x = x;
        this.y = y;
        this.radius = dimension * 0.3;
        this.speed = 2;
        this.time = 300;
        this.newX = x;
        this.newY = y;
    };

    draw() {
        this.c.clearRect(this.x - this.radius - 2, this.y - this.radius - 2, this.radius * 2 + 4, this.radius * 2 + 4);
        this.c.beginPath();
        this.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.c.fillStyle = this.color;
        this.c.stroke();
        this.c.fill();
        this.c.closePath();
    };
    
    async update() {
        if (((this.x - this.newX) > 0 ? (this.x - this.newX) : (this.newX - this.x)) < this.speed && ((this.y - this.newY) > 0 ? (this.y - this.newY) : (this.newY - this.y)) < this.speed) return;

        if (this.x < this.newX) this.x += this.speed;
        if (this.x > this.newX) this.x -= this.speed;
        if (this.y < this.newY) this.y += this.speed;
        if (this.y > this.newY) this.y -= this.speed;

        this.draw();

        await new Promise(resolve => setTimeout(resolve, 0));

        this.update();

        // VERY <IMPORTANT></IMPORTANT>
        // dont write like setTimeout(this.update, (this.speed * 1000) / this.dimension);
        // because the this value will change and aon next return, this will refer to something else, not the class

        // can write like setTimeout(this.update.bind(this), (this.speed * 1000) / this.dimension);
        // or define the main function update itself as arrow function
    };

    set(direction) {
        this.x = this.newX;
        this.y = this.newY;
        this.c.clearRect(this.x - this.dimension, this.y - this.dimension, this.dimension * 2, this.dimension * 2);

        switch (direction) {
            case 'UP': {
                this.newY -= this.dimension * 2;
                break;
            }
            case 'RIGHT': {
                this.newX += this.dimension * 2;
                break;
            }
            case 'DOWN': {
                this.newY += this.dimension * 2;
                break;
            }
            default: this.newX -= this.dimension * 2;
        }

        this.update();
    };

    changePlayer() {
        this.player = player;
        this.color = colors[player];
    };

    move(number, pos) {
        this.x = this.newX;
        this.y = this.newY;

        if (number === 2) {
            if (pos === 0) {
                this.c.clearRect(this.x - this.dimension, this.y - this.dimension, this.dimension * 2, this.dimension * 2);
                this.x -= this.dimension / 2;
            }
            else this.x += this.dimension / 2;
        }
        else {
            if (pos === 0) {
                this.c.clearRect(this.x - this.dimension, this.y - this.dimension, this.dimension * 2, this.dimension * 2);
                this.x -= this.dimension / 2;
                this.y += this.dimension / 2;
            }
            else if (pos === 1) {
                this.x -= this.dimension / 2;
                this.y -= this.dimension / 2;
            }
            else this.x += this.dimension / 2;
        }

        this.draw();
    };
};

const balls = [], colors = ['lightgreen', 'red'], array = [], players = {}, pop = new Audio('/sfx-pop (mp3cut.net).mp3');

for (let i = 0; i < 4; i++) {
    array.push([]);

    for (let j = 0; j < 4; j++) {
        array[i].push([]);
    }
}

let player = 0, boxes;

function printarr(arr) {
    const a = [];

    for (let i = 0; i < arr.length; i++) {
        a.push([]);
    
        for (let j = 0; j < arr.length; j++) {
            a[i].push(arr[i][j].length > 0 ? [...arr[i][j]] : []);
        }
    }

    return a;
};

function Board(props) {
    const canvas = useRef();
    const context = useRef();

    const check = useCallback(async (col, row) => {
        const ballarr = array[col][row];
    
        ballarr.forEach(number => {
            if (balls[number].player !== player) {
                balls[number].changePlayer();
                players[balls[number].player]--;
            }
        });
    
        if (ballarr.length === 1) return;
    
        const time = balls[ballarr[0]].time;
    
        if (ballarr.length === 2) {
            if (col === 0 && row === 0) {
                await pop.play();
                balls[ballarr[0]].set('RIGHT');
                balls[ballarr[1]].set('DOWN');
                
                await new Promise(yay => setTimeout(yay, time));
        
                array[col + 1][row].push(ballarr[0]);
                array[col][row + 1].push(ballarr[1]);
                array[col][row] = [];
    
                await Promise.all([check(col + 1, row), check(col, row + 1)]);
            }
            else if (col === 0 && row === array.length - 1) {
                await pop.play();
                balls[ballarr[0]].set('RIGHT');
                balls[ballarr[1]].set('UP');
    
                await new Promise(yay => setTimeout(yay, time));
                
                array[col + 1][row].push(ballarr[0]);
                array[col][row - 1].push(ballarr[1]);
                array[col][row] = [];
    
                await Promise.all([check(col + 1, row), check(col, row - 1)]);
            }
            else if (col === array.length - 1 && row === 0) {
                await pop.play();
                balls[ballarr[0]].set('LEFT');
                balls[ballarr[1]].set('DOWN');
                
                await new Promise(yay => setTimeout(yay, time));
                
                array[col - 1][row].push(ballarr[0]);
                array[col][row + 1].push(ballarr[1]);
                array[col][row] = [];
    
                await Promise.all([check(col - 1, row), check(col, row + 1)]);
            }
            else if (col === array.length - 1 && row === array.length - 1) {
                await pop.play();
                balls[ballarr[0]].set('LEFT');
                balls[ballarr[1]].set('UP');
                
                await new Promise(yay => setTimeout(yay, time));
                
                array[col - 1][row].push(ballarr[0]);
                array[col][row - 1].push(ballarr[1]);
                array[col][row] = [];
    
                await Promise.all([check(col - 1, row), check(col, row - 1)]);
            }
            else {
                balls[ballarr[0]].move(2, 0);
                balls[ballarr[1]].move(2, 1);
            }
        }
        else if (ballarr.length === 3) {
            if (col === 0) {
                await pop.play();
                balls[ballarr[0]].set('RIGHT');
                balls[ballarr[1]].set('DOWN');
                balls[ballarr[2]].set('UP');
                
                await new Promise(yay => setTimeout(yay, time));
                
                array[col + 1][row].push(ballarr[0]);
                array[col][row + 1].push(ballarr[1]);
                array[col][row - 1].push(ballarr[2]);
                array[col][row] = [];
    
                await Promise.all([check(col + 1, row), check(col, row + 1), check(col, row - 1)]);
            }
            else if (col === array.length - 1) {
                await pop.play();
                balls[ballarr[0]].set('LEFT');
                balls[ballarr[1]].set('DOWN');
                balls[ballarr[2]].set('UP');
                
                await new Promise(yay => setTimeout(yay, time));
                
                array[col - 1][row].push(ballarr[0]);
                array[col][row + 1].push(ballarr[1]);
                array[col][row - 1].push(ballarr[2]);
                array[col][row] = [];
    
                await Promise.all([check(col - 1, row), check(col, row + 1), check(col, row - 1)]);
            }
            else if (row === 0) {
                await pop.play();
                balls[ballarr[0]].set('LEFT');
                balls[ballarr[1]].set('DOWN');
                balls[ballarr[2]].set('RIGHT');
                
                await new Promise(yay => setTimeout(yay, time));
                
                array[col - 1][row].push(ballarr[0]);
                array[col][row + 1].push(ballarr[1]);
                array[col + 1][row].push(ballarr[2]);
                array[col][row] = [];
    
                await Promise.all([check(col - 1, row), check(col, row + 1), check(col + 1, row)]);
            }
            else if (row === array.length - 1) {
                await pop.play();
                balls[ballarr[0]].set('LEFT');
                balls[ballarr[1]].set('UP');
                balls[ballarr[2]].set('RIGHT');
                
                await new Promise(yay => setTimeout(yay, time));
                
                array[col - 1][row].push(ballarr[0]);
                array[col][row - 1].push(ballarr[1]);
                array[col + 1][row].push(ballarr[2]);
                array[col][row] = [];
    
                await Promise.all([check(col - 1, row), check(col, row - 1), check(col + 1, row)]);
            }
            else {
                balls[ballarr[0]].move(3, 0);
                balls[ballarr[1]].move(3, 1);
                balls[ballarr[2]].move(3, 2);
            }
        }
        else if (ballarr.length === 4) {
            await pop.play();
            balls[ballarr[0]].set('LEFT');
            balls[ballarr[1]].set('UP');
            balls[ballarr[2]].set('RIGHT');
            balls[ballarr[3]].set('DOWN');
            
            await new Promise(yay => setTimeout(yay, time));
            console.log(col, row)
            array[col - 1][row].push(ballarr[0]);
            console.log(printarr(array))
            array[col][row - 1].push(ballarr[1]);
            console.log(printarr(array))
            array[col + 1][row].push(ballarr[2]);
            console.log(printarr(array))
            array[col][row + 1].push(ballarr[3]);
            console.log(printarr(array))
            array[col][row] = [];
            console.log(printarr(array))
    
            await Promise.all([check(col - 1, row), check(col, row - 1), check(col + 1, row), check(col, row + 1)]);
        }
    }, []);

    useEffect(() => {
        boxes = document.querySelectorAll(`.${styles.box}`);

        context.current = canvas.current.getContext('2d');

        canvas.current.width = 400;
        canvas.current.height = 400;
    }, []);

    async function addBall(e) {
        const index = e.target.getAttribute('data-pos'), col = index % 4, row = Math.floor(index / 4);

        if (array[col][row].length !== 0 && balls[array[col][row][0]].player !== player) return;

        const dimension = parseInt(getComputedStyle(e.target).width) / 2;

        balls.push(new Ball(dimension, context.current, player, colors[player], (canvas.current.width / 4) * col + dimension, (canvas.current.width / 4) * row + dimension));
        balls[balls.length - 1].draw();

        array[col][row].push(balls.length - 1);

        if (!players[player]) players[player] = 1;
        else players[player]++;

        await pop.play();
        await check(col, row);

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

export default Board;