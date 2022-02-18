window.addEventListener('load', function(){
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;
    let enemies = [];
    let monkeyEnemies = [];
    let bullets = [];
    let bosses = [];
    let items = [];
    let warning = [];
    let score = 0;
    let gameOver = false;

    class InputHandler {
        constructor(){
            this.keys = [];
            window.addEventListener('keydown', e => { // 화살표함수는 언제나 상위스코프를 가르킨다.
                if((e.key === 'ArrowDown' || 
                    e.key === 'ArrowUp' || 
                    e.key === 'ArrowLeft' || 
                    e.key === 'ArrowRight' || 
                    e.key === 'a' ||
                    e.key === 's') 
                    && this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if((e.key === 'ArrowDown' || 
                    e.key === 'ArrowUp' || 
                    e.key === 'ArrowLeft' || 
                    e.key === 'ArrowRight' || 
                    e.key === 'a' ||
                    e.key === 's')){
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 150;
            this.height = 150;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById("playerImage");
            this.frameX = 0;
            this.maxFrame = 5;
            this.frameY = 0;
            this.fps = 10;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.doubleJump = false;
            this.lastBullet = 0;
            this.hp = 30;
            this.nowHp = this.hp;
        }
        draw(context){
            // context.strokeStyle = 'black';
            // context.strokeRect(this.x, this.y, this.width, this.height);
            // context.beginPath();
            // context.arc(this.x + this.width / 2, this.y + this.height/2, this.width/2, 0, Math.PI*2);
            // context.stroke();
            context.drawImage(this.image, this.width * this.frameX, this.height * this.frameY , this.width, this.height, this.x, this.y, this.width, this.height);
            context.fillStyle = "tomato";
            context.fillRect((this.x+this.width/2)-this.hp/2, this.y, this.hp, 10);
            context.fillStyle = "yellow";
            context.fillRect((this.x+this.width/2)-(this.lastBullet*2)/2, this.y+12, this.lastBullet*2, 7);
            // context.drawImage(이미지, x절단좌표, y절단좌표, 절단폭, 절단높이, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime, enemies, enemyMonkey, bosses, items){
            this.hp = this.nowHp * life;
            if(this.lastBullet <= 0){
                weapon = 'normal';
            }
            items.forEach(item => {
                const dx = (item.x + item.width/2) - (this.x + this.width/2);
                const dy = (item.y + item.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < item.width/2 + this.width/2){
                    item.markedForDeletion = true;
                    this.lastBullet += 30; 
                    weapon = "banana";
                }
            });
            // boss 
            bosses.forEach(boss => {
                const dx = (boss.x + boss.width/2) - (this.x + this.width/2);
                const dy = (boss.y + boss.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < boss.width*0.4 + this.width*0.4){
                    gameOver = true;
                    enemy.markedForDeletion = true;
                }
            });

            // monkeys
            enemyMonkey.forEach(monkey => {
                const dx = (monkey.x + monkey.width/2) - (this.x + this.width/2);
                const dy = (monkey.y + monkey.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < monkey.width*0.3 + this.width*0.3){
                    if(!(input.keys.indexOf('ArrowDown') > -1)){
                        gameOver = true;
                        monkey.markedForDeletion = true;
                    }
                }
            });

            // collision detection
            enemies.forEach(enemy => {
                const dx = (enemy.x+enemy.width/2) - (this.x+this.width/2);
                const dy = (enemy.y+enemy.height/2) - (this.y+this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if(distance < enemy.width*0.3 + this.width*0.3){
                    if(0 < enemy.y - (this.y+81)){
                        enemy.markedForDeletion = true;
                        score+=100;
                        bossTimer++;
                    }else if(this.frameY == 3){
                        enemy.switch = true;
                    }else {
                        gameOver = true;
                        enemy.markedForDeletion = true;
                    }
                }
                if(enemy.x < 0 - enemy.width){
                    enemy.markedForDeletion = true;
                    score+=100;
                    bossTimer++;
                }
            })
            // sprite animation
            if(this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame) {
                    this.frameX = 0;
                }else this.frameX++;
                this.frameTimer = 0;
            }else {
                this.frameTimer += deltaTime;
            }

            // controls
            if(input.keys.indexOf('ArrowRight') > -1){
                this.speed = 5;
            }else if(input.keys.indexOf('ArrowLeft') > -1){
                this.speed = -5;
            }else if(input.keys.indexOf('ArrowUp') > -1 && this.onGround()){
                this.vy -= 18;
            }else{
                if(this.onGround()) this.doubleJump = false;
                this.speed = 0;
            }
            // 수평움직임
            this.x+=this.speed;
            if(this.x < 0) this.x = 0;
            else if(this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
            // 수직움직임
            this.y += this.vy;
            if(!this.onGround()){
                this.vy += this.weight;
                this.maxFrame = 2;
                this.frameY = 1;
            }else {
                if(input.keys.indexOf('ArrowDown') > -1){
                    this.maxFrame = 2;
                    this.frameY = 2;
                }else if(input.keys.indexOf('a') > -1){
                    this.maxFrame = 3;
                    this.frameY = 3;
                }else if(input.keys.indexOf('s') > -1){
                    this.maxFrame = 3;
                    this.frameY = 4;
                }else {
                    this.maxFrame = 4;
                    this.frameY = 0;
                }
                this.vy = 0;
            }
            if(this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height
            }
        }
        onGround(){
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2714;
            this.height = 500;
            this.speed = 7;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width -this.speed, this.y, this.width, this.height);
        }
        update(){
            this.x -= this.speed;
            if(this.x < 0 - this.width){
                this.x = 0;
            }
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 74;
            this.image = document.getElementById("enemyImage");
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 12;
            this.markedForDeletion = false;
            this.switch = false;
            this.hp = 16;
        }
        draw(context){
            // context.strokeStyle = 'white';
            // context.strokeRect(this.x, this.y, this.width, this.height);
            // context.beginPath();
            // context.arc(this.x + this.width/2, this.y+this.height/2, this.width/2, 0, Math.PI*2);
            // context.stroke();
            context.drawImage(this.image, this.width * this.frameX, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime, bullets){
            bullets.forEach(bullet => {
                const dx = (bullet.x + bullet.width/2) - (this.x + this.width/2);
                const dy = (bullet.y + bullet.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < bullet.width/2 + this.width/2){
                    this.x+=this.speed*3;
                    this.hp -= bullet.damage;
                    bullet.markedForDeletion = true;
                    if(this.hp <= 0){
                        this.markedForDeletion = true;
                        score+=100;
                        bossTimer++;
                    }
                }
            });

            if(this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            }else {
                this.frameTimer += deltaTime;
            }
            if(!this.switch) this.x -= this.speed;
            else this.x += this.speed*2;

            if(this.x < 0  - this.width || this.x > this.gameWidth+this.width){
                this.markedForDeletion = true;
                score+=100;
                bossTimer++;
            }
        }
    }

    class Munzy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 100;
            this.x = this.gameWidth + this.width;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById("munzy");
            this.fps = 10;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 5;
            this.speed = 3;
            this.hp = 100;
            this.hit = false;
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
            context.fillStyle = "red"
            context.fillRect((this.x+this.width/2)-this.hp/2, this.y, this.hp, 7);
        }

        update(timeStamp, bullets){
            bullets.forEach(bullet => {
                const dx = (bullet.x + bullet.width/2) - (this.x + this.width/2);
                const dy = (bullet.y + bullet.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < bullet.width*0.3 + this.width*0.3){
                    this.frameX = 0;
                    this.hit = true;
                    this.hp-=bullet.damage;
                    this.x+=this.speed*5;
                    bullet.markedForDeletion = true;
                    if(this.hp <= 0){
                        this.markedForDeletion = true;
                    }
                }
            });
            if(this.frameTimer > this.frameInterval){
                if(this.hit){
                    this.frameY = 1;
                    this.maxFrame = 3;
                }else {
                    this.frameY = 0;
                    this.maxFrame = 5;
                }

                if(this.frameX >= this.maxFrame){
                    if(this.hit) this.hit = false;
                    this.frameX = 0;
                }else this.frameX++;
                this.frameTimer = 0;
            }else this.frameTimer+=timeStamp;
            this.x-=this.speed;
        }
    }

    class Kirby {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 100;
            this.x = this.gameWidth + this.width;
            this.y = this.gameHeight - this.height*3;
            this.vy = 0;
            this.image = document.getElementById("kirby");
            this.fps = 10;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 3;
            this.speed = 3;
            this.hp = 24;
            this.hit = false;
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(timeStamp, bullets){
            bullets.forEach(bullet => {
                const dx = (bullet.x + bullet.width/2) - (this.x + this.width/2);
                const dy = (bullet.y + bullet.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < bullet.width*0.3 + this.width*0.3){
                    this.frameX = 0;
                    this.hp-=bullet.damage;
                    this.x+=this.speed*5;
                    this.hit = true;
                    this.vy = 8;
                    this.frameY = 1;
                    bullet.markedForDeletion = true;
                    if(this.hp <= 0){
                        score+=200;
                        this.markedForDeletion = true;
                        bossTimer++;
                    }
                }
            });
            if(this.frameTimer > this.frameInterval){
                if(this.hit){
                    if(this.frameY === 0){
                        this.frameY = 2;
                    }else {
                        this.frameY = 3;
                    };
                    this.maxFrame = 1;
                    
                }else {
                    if(this.y <= this.gameHeight - this.height*3){
                        this.frameY = 0;
                        this.maxFrame = 3;
                    }else {
                        this.frameY = 1;
                        this.maxFrame = 7;
                    }
                }

                if(this.frameX >= this.maxFrame){
                    if(this.hit) this.hit = false;
                    this.frameX = 0;
                }else this.frameX++;
                this.frameTimer = 0;
            }else this.frameTimer+=timeStamp;
            this.x-=this.speed;
            this.y+=this.vy;
            if(this.y > this.gameHeight - this.height){
                this.y = this.gameHeight - this.height;
            }
        }

    }

    class MonkeyEnemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 100;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height*1.5;
            this.image = document.getElementById("monkeyEnemy");
            this.fps = 10;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.frameX = 0;
            this.maxFrame = 4;
            this.speed = 12;
            this.markedForDeletion = false; 
            this.hp = 32;
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(deltaTime, bullets){
            bullets.forEach(bullet => {
                const dx = (bullet.x + bullet.width/2) - (this.x + this.width/2);
                const dy = (bullet.y + bullet.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < bullet.width/2 + this.width/2){
                    if(!(bullet.weapon === "normal")){
                        this.hp-=bullet.damage;
                        this.x += this.speed*5;
                        bullet.markedForDeletion = true;
                        if(this.hp <= 0){
                            this.markedForDeletion = true; 
                        }
                    }
                }
            });

            if(this.frameTimer > this.frameInterval){
                if(this.maxFrame > this.frameX){
                    this.frameX++
                }else this.frameX = 0;
                this.frameTimer = 0;
            }else this.frameTimer+=deltaTime;

            this.x -= this.speed;
            if(this.x < 0){
                this.markedForDeletion = true;
                score+=100;
                bossTimer++;
            }
        }
    }

    class Boss {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 250;
            this.height = 400;
            this.x = this.gameWidth + this.width;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById("boss01");
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 5;
            this.fps = 10;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 1;
            this.hp = 100+(bossLv*40);
            this.markedForDeletion = false;
            this.hit = false;
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height)
            context.fillStyle = 'red';
            context.fillRect((this.x+this.width/2) - this.hp/2, this.y, this.hp, 20);
        }

        update(timeStamp, bullets){

            bullets.forEach(bullet => {
                const dx = (bullet.x + bullet.width/2) - (this.x + this.width/2);
                const dy = (bullet.y + bullet.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < bullet.width*0.6 + this.width*0.6){
                    bullet.markedForDeletion = true;
                    this.hit = true;
                    this.frameX = 0;
                    this.hp-=bullet.damage;
                    this.x+=8;
                }
            });
            // sprite animation
            if(this.frameTimer > this.frameInterval){
                if(this.hit){
                    this.frameY = 1;
                    this.maxFrame = 1;
                }else {
                    this.frameY = 0;
                    this.maxFrame = 5;
                }

                if(this.frameX >= this.maxFrame){
                    this.frameX = 0;
                    this.hit = false;
                }else this.frameX++;
                this.frameTimer = 0;
            }else {
                this.frameTimer+=timeStamp;
            }
            // this.hp

            if(this.hp <= 0){
                this.markedForDeletion = true;
                score+=5000;
            }
            this.x-=this.speed;
        }
    }

    class Taxi {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 300;
            this.height = 180;
            this.x = this.gameWidth + this.width;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById("taxi");
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 10;
            this.fps = 8;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.markedForDeletion = false;
            this.hit = false;
            this.speed = 0.8;
            this.hp = 250+(bossLv*40);
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX,  this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
            context.fillStyle = 'red';
            context.fillRect((this.x+this.width/2) - this.hp/2, this.y, this.hp, 20);
        }

        update(timeStamp, bullets){
            this.x -= this.speed;

            if(this.frameTimer > this.frameInterval){
                if(this.hp <= 175){
                    if(this.hit){
                        this.frameY = 3;
                        this.maxFrame = 3;
                    }else {
                        this.frameY = 1;
                        this.maxFrame = 7;
                    }
                }else {
                    if(this.hit){
                        this.frameY = 2;
                        this.maxFrame = 3;
                    }else {
                        this.frameY = 0;
                        this.maxFrame = 10;
                    }
                }

                if(this.frameX >= this.maxFrame){
                    if(this.hit) this.hit = false;
                    this.frameX = 0;
                    this.frameTimer = 0;
                }else this.frameX++;
            }else this.frameTimer+=timeStamp;

            bullets.forEach(bullet => {
                const dx = (bullet.x + bullet.width/2) - (this.x + this.width/2);
                const dy = (bullet.y + bullet.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < bullet.width/2 + this.width/2){
                    this.x += this.speed*5
                    this.hit = true;
                    this.frameX = 0;
                    this.hp-=bullet.damage;
                    bullet.markedForDeletion = true;
                    if(this.hp <= 0){
                        this.markedForDeletion = true;
                    }
                }
            })
        }
    }

    class Edgeworth {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.nowStates = {
                width:400,
                height:400,
                maxFrame:9,
                frameY:0
            }
            this.width = this.nowStates.width;
            this.height = 400;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById("edgeworth");
            this.frameX = 0;
            this.frameY = this.nowStates.frameY;
            this.maxFrame = this.nowStates.maxFrame;
            this.fps = 5;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 2;
            this.attackTimer = 0;
            this.attackInterval = 4000;
            this.states = "normal";
            this.attackMode = false;
            this.markedForDeletion = false;
            this.hp = 500+(bossLv*40);
            this.nowHp = this.hp;
        }
        state(){
            let nowState = {};
            if(this.states === "normal"){
                nowState = {
                    width:400,
                    maxFrame:9,
                    frameY:0,
                    fps:5
                };
            }else if(this.states === "angry"){
                nowState = {
                    width:500,
                    maxFrame:5,
                    frameY:2,
                    fps:5
                };
            }else if(this.states === "attack"){
                nowState = {
                    width:450,
                    maxFrame:4,
                    frameY:1,
                    fps:5
                };
            }else if(this.states === "normalHit"){
                nowState = {
                    width:400,
                    maxFrame:3,
                    frameY:3,
                    fps:30
                };
            }else if(this.states === "angryHit"){
                nowState = {
                    width:500,
                    maxFrame:3,
                    frameY:5,
                    fps:30
                };
            }else if(this.states === "attackHit"){
                nowState = {
                    width:450,
                    maxFrame:1,
                    frameY:4,
                    fps:30
                };
            }
            return nowState;
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
            context.fillStyle = 'red';
            context.fillRect((this.x+this.width/2) - this.hp/2, this.y, this.hp, 20);
        }

        update(timeStamp){
            bullets.forEach(bullet => {
                const dx = (bullet.x + bullet.width/2) - (this.x + this.width/2);
                const dy = (bullet.y + bullet.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < bullet.width/2 + this.width/2){
                    this.hp-=bullet.damage;
                    bullet.markedForDeletion = true;
                    if(this.states === "normal") this.states = "normalHit"
                    else if(this.states === "angry") this.states = "angryHit";
                    else if(this.states === "attack") this.states = "attackHit";
                    if(this.hp <= 0){
                        this.markedForDeletion = true;
                        score+=5000;
                    }
                }
            });


            this.nowStates = this.state();
            this.width = this.nowStates.width;
            this.frameY = this.nowStates.frameY;
            this.maxFrame = this.nowStates.maxFrame;
            this.fps = this.nowStates.fps;

            if((this.hp > this.nowHp/2) && 
                this.states!=="attack" && 
                this.states!=="attackHit" && 
                this.states!=="normalHit" && 
                this.states!=="angryHit") this.states = "normal";
            if((this.hp < this.nowHp/2) && 
                this.states!=="attack" && 
                this.states!=="attackHit" && 
                this.states!=="normalHit" && 
                this.states!=="angryHit"){
                this.states = "angry";
                this.attackInterval = 2000;
            }

            if(this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame){
                    if(this.states !== "attackHit"){
                        this.states = "normal";
                        this.frameX = 0;
                    }else {
                        this.states = "attack";
                    }
                }else this.frameX++
                this.frameTimer = 0;
            }else {
                this.frameTimer+=timeStamp;
            }

            this.x-=this.speed;

            if(this.x < this.gameWidth - this.width){
                this.speed = 0;
                this.attackMode = true;
            }

            if(this.attackMode){
                if(this.attackTimer > this.attackInterval){
                    this.createEnemy(Math.floor(Math.random()*3));
                    this.frameX = 0;
                    this.states = "attack";
                    this.attackTimer = 0;
                }else this.attackTimer+=timeStamp;
            }
            console.log((this.x < this.gameWidth - this.width));
            
        }

        createEnemy(number){
            let enemy;
            if(number === 0){
                enemy = new Enemy(canvas.width, canvas.height);
            }else if(number === 1){
                enemy = new Kirby(canvas.width, canvas.height);
            }else if(number === 2){
                enemy = new Munzy(canvas.width, canvas.height);
            }
            enemies.push(enemy);
        }
    }
    
    class Bullet {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 25;
            this.height = 27;
            this.x = 0
            this.y = 0
            this.image = document.getElementById("bullet");
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 1;
            this.fps = 15;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 10;
            this.markedForDeletion = false;
            this.weapon = "normal";
            this.damage = 8+bossLv;
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(timeStamp){
            if(this.frameTimer > this.frameInterval){
                if(this.frameX < this.maxFrame){
                    this.frameX++;
                }else this.frameX = 0;
                this.frameTimer = 0;
            }else this.frameTimer+=timeStamp;
            if(this.x > this.gameWidth) this.markedForDeletion = true;

            this.x += this.speed;
        }
    }

    class Items {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 80;
            this.height = 80;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height*3;
            this.image = document.getElementById("items");
            this.fps = 10;
            this.frameInterval = 1000/this.fps;
            this.frameTimer = 0;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 2;
            this.speed = 3;
            this.markedForDeletion = false;
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(timeStamp){
            if(this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame){
                    this.frameX = 0;
                }else{
                    this.frameX++;
                }
                this.frameTimer = 0;
            }else{
                this.frameTimer+=timeStamp;
            }
            this.x -= this.speed;
        }
    }

    class Warning {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 400;
            this.height = 200;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height*2;
            this.fps = 10;
            this.frameInterval = 30000/this.fps;
            this.frameTimer = 0;
            this.speed = 8;
            this.markedForDeletion = false;
        }

        draw(context){
            context.font = '80px Helvetica';
            context.fillStyle = "red";
            context.fillRect(this.x, this.y+20, this.width, 10);
            context.fillText("WARNING", this.x, this.height);
            context.fillRect(this.x, this.y+120, this.width, 10);
        }

        update(timeStamp){
            if(this.x < this.gameWidth/2-this.width/2){
                this.speed = 0;
                if(this.frameTimer > this.frameInterval){
                    this.markedForDeletion = true;
                }else this.frameTimer+=timeStamp;
            }
            this.x -= this.speed;
        }
    }
    // enemies.push(new Enemy(canvas.width, canvas.height));

    function kirbyHandler(timeStamp){
        if(bossLv >= 0 && (kirbyTimer > (monkeyEnemyInterval*2) + (monkeyRandomEnemyInterval*2))){
            if(bossLv >= 0){
                const kirby = new Kirby(canvas.width, canvas.height);
                enemies.push(kirby);
            }
            kirbyTimer = 0;
        }else kirbyTimer+=timeStamp;
    }

    function munzyHandler(timeStamp){
        if(bossLv > 2 && (munzyTimer > (monkeyEnemyInterval) + (monkeyRandomEnemyInterval*2))){
            if(bossLv >= 0){
                const munzy = new Munzy(canvas.width, canvas.height);
                enemies.push(munzy);
            }
            munzyTimer = 0;
        }else munzyTimer+=timeStamp;
    }

    function itemsHandler(timeStamp){
        //(monkeyEnemyInterval*3) + (monkeyRandomEnemyInterval*5)
        if(itemsTimer > (monkeyEnemyInterval*4) + (monkeyRandomEnemyInterval*5)){
            const item = new Items(canvas.width, canvas.height);
            items.push(item);
            itemsTimer = 0;
        }else itemsTimer+=timeStamp;
        
        items.forEach(item => {
            item.draw(ctx);
            item.update(timeStamp);
        });

        items = items.filter(item => !item.markedForDeletion);
    }

    function bossHandler(timeStamp){
        if(bossTimer >= 20){
            let boss;
            bossLv++;
            if(bossLv%3 === 1) boss = new Boss(canvas.width, canvas.height);
            else if(bossLv%3 === 2) boss = new Taxi(canvas.width, canvas.height);
            else if(bossLv%3 === 0) boss = new Edgeworth(canvas.width, canvas.height);
            bosses.push(boss);
            bossTimer = 0;

            const warningMessage = new Warning(canvas.width, canvas.height);
            warning.push(warningMessage);
        }
        bosses.forEach(boss => {
            boss.draw(ctx);
            boss.update(timeStamp, bullets);
        });

        warning.forEach(message => {
            message.draw(ctx);
            message.update(timeStamp);
        })



        bosses = bosses.filter(boss => !boss.markedForDeletion);
        warning = warning.filter(message => !message.markedForDeletion);
    }

    function bulletHandler(timeStamp, player, input){
        if(input.keys.indexOf('s') > -1){
            if(bulletTimer > bulletInterval){
                const bullet = new Bullet(canvas.width, canvas.height);
                bullet.x = player.x+player.width;
                bullet.y = player.y+(player.height/2);
                if(weapon === "banana"){
                    bullet.weapon = weapon;
                    bullet.damage = 16;
                    bullet.frameY = 1;
                    bullet.maxFrame = 2;
                    bulletInterval = 100;
                }else if(weapon === 'normal'){
                    bullet.damage = 8;
                    bullet.frameY = 0;
                    bullet.maxFrame = 1;
                    bulletInterval = 400 - bossLv*(400*0.1);
                    if(bulletInterval <= 200){
                        bulletInterval = 200;
                    }
                }
                if(!(weapon === "normal") && player.lastBullet > 0){
                    player.lastBullet--;
                }

                bullets.push(bullet);
                bulletTimer = 0;
            }else bulletTimer+=timeStamp;
        }

        bullets.forEach((bullet) => {
            bullet.draw(ctx);
            bullet.update(timeStamp);
        });

        bullets = bullets.filter((bullet) => !bullet.markedForDeletion);
    }

    function monkeyEnemyHandler(deltaTime){
        if(monkeyEnemyTimer > monkeyEnemyInterval + monkeyRandomEnemyInterval){
            if(bossLv >= 2){
                const monkeyEnemy = new MonkeyEnemy(canvas.width, canvas.height);
                const monkeySpeed = Math.floor(Math.random()*monkeyEnemy.speed);
                if(monkeySpeed < 6) monkeyEnemy.speed = 6;
                else monkeyEnemy.speed = monkeySpeed;
                monkeyEnemies.push(monkeyEnemy);
                monkeyEnemyTimer = 0;
            }
        }else monkeyEnemyTimer+=deltaTime;

        monkeyEnemies.forEach((monkey) => {
            monkey.draw(ctx);
            monkey.update(deltaTime, bullets);
        });
        monkeyEnemies = monkeyEnemies.filter((monkey) => !monkey.markedForDeletion);
    }

    function handleEnemies(deltaTime){
        if(enemyTimer > enemyInterval + randomEnemyInterval){
            const enemy = new Enemy(canvas.width, canvas.height);
            enemy.speed = Math.floor(Math.random()*12);
            enemies.push(enemy);
            enemyTimer = 0;
        }else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime, bullets);
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function displayStatusText(context){
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: '+score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score: '+score, 22, 52);
        context.fillStyle = 'black';
        context.fillText('Key : Arrow, a, s',20, 90);
        context.fillStyle = 'white';
        context.fillText('Key : Arrow, a, s',22, 92);
        if(!gameOver){
            context.textAlign = 'left';
        }else {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, try again', canvas.width/2, 200);
            context.fillText('Press "r" !!', canvas.width/2, 250);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, try again!', canvas.width/2 + 2, 202);
            context.fillText('Press "r" !!', canvas.width/2+2, 252);
        }
    }
    // life
    let life = 3;

    // items
    let itemsTimer = 0;
    let weapon = "normal";
    
    // bossTimer 
    let bossTimer = 0;
    let bossLv = 0;

    // bullet
    let bulletTimer = 0;
    let bulletInterval = 400;

    // enemy
    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 600;
    let randomEnemyInterval = Math.random() * 1000 + 500;
    //munzy 
    let munzyTimer = 0;

    //kirby
    let kirbyTimer = 0;

    //monkeyenemy
    let monkeyEnemyTimer = 0;
    let monkeyEnemyInterval = 5000;
    let monkeyRandomEnemyInterval = Math.random() * 1000 + 500;

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies, monkeyEnemies, bosses, items);
        bossHandler(deltaTime);
        itemsHandler(deltaTime);
        handleEnemies(deltaTime);
        monkeyEnemyHandler(deltaTime);
        munzyHandler(deltaTime);
        kirbyHandler(deltaTime);
        bulletHandler(deltaTime, player, input);
        displayStatusText(ctx);
        if(!gameOver) requestAnimationFrame(animate);
    }
    animate(0);
    window.addEventListener("keydown", function(e){
        console.log(e);
        if(e.key === "r" && gameOver && life > 0 ){
            gameOver = false;
            animate(0);
            life--;
        }
    });
});