window.addEventListener('load', function(){
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;
    let enemies = [];
    let monkeyEnemies = [];
    let bullets = [];
    let bosses = [];
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
            this.bulletTimer = 0;
            this.bulletDelay = 10000/this.fps;
        }
        draw(context){
            // context.strokeStyle = 'black';
            // context.strokeRect(this.x, this.y, this.width, this.height);
            // context.beginPath();
            // context.arc(this.x + this.width / 2, this.y + this.height/2, this.width/2, 0, Math.PI*2);
            // context.stroke();
            context.drawImage(this.image, this.width * this.frameX, this.height * this.frameY , this.width, this.height, this.x, this.y, this.width, this.height);
            // context.drawImage(이미지, x절단좌표, y절단좌표, 절단폭, 절단높이, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime, enemies, enemyMonkey, bosses){
            // boss 

            bosses.forEach(boss => {
                const dx = (boss.x + boss.width/2) - (this.x + this.width/2);
                const dy = (boss.y + boss.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < boss.width*0.3 + this.width*0.3){
                    gameOver = true;
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
                    }
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
            }else if(input.keys.indexOf('ArrowUp') > -1){
                if(this.onGround()) this.vy -= 12;
                else if(!this.onGround() && !this.doubleJump && (this.y < this.gameHeight - this.height*1.4)){
                    this.vy -= 12;
                    this.doubleJump = true;
                }
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
                this.doubleJump = false;
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
            this.width = 2400;
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
        }
        draw(context){
            // context.strokeStyle = 'white';
            // context.strokeRect(this.x, this.y, this.width, this.height);
            // context.beginPath();
            // context.arc(this.x + this.width/2, this.y+this.height/2, this.width/2, 0, Math.PI*2);
            // context.stroke();
            context.drawImage(this.image, this.width * this.frameX, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime){
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
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(deltaTime){
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
            this.width = 400;
            this.height = 400;
            this.x = this.gameWidth + this.width;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 15;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 1;
            this.hp = 100;
            this.markedForDeletion = false;
        }

        draw(context){
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        update(bullets){
            bullets.forEach(bullet => {
                const dx = (bullet.x + bullet.width/2) - (this.x + this.width/2);
                const dy = (bullet.y + bullet.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx+dy*dy);
                if(distance < bullet.width/2 + this.width/2){
                    bullet.markedForDeletion = true;
                    this.hp-=10;
                    this.x+=3;
                }
            });
            if(this.hp <= 0){
                this.markedForDeletion = true;
                score+=5000;
            }
            this.x-=this.speed;
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
            this.frameX = 0
            this.maxFrame = 1;
            this.fps = 1;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 10;
            this.markedForDeletion = false;
        }

        draw(context){
            context.drawImage(this.image, this.width*this.frameX, 0, this.width, this.height, this.x, this.y, this.width, this.height);
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

    // enemies.push(new Enemy(canvas.width, canvas.height));

    function bossHandler(timeStamp){
        if(bossTimer == 20){
            const boss = new Boss(canvas.width, canvas.height);
            boss.hp = boss.hp+(bossLv*40);
            bosses.push(boss);
            bossTimer = 0;
            bossLv++;
        }

        bosses.forEach(boss => {
            boss.draw(ctx);
            boss.update(bullets);
        });

        bosses = bosses.filter(boss => !boss.markedForDeletion);
    }

    function bulletHandler(timeStamp, player, input){
        if(input.keys.indexOf('s') > -1){
            if(bulletTimer > bulletInterval){
                const bullet = new Bullet(canvas.width, canvas.height);
                bullet.x = player.x+player.width;
                bullet.y = player.y+(player.height/2);
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
            const monkeyEnemy = new MonkeyEnemy(canvas.width, canvas.height);
            const monkeySpeed = Math.floor(Math.random()*monkeyEnemy.speed);
            if(monkeySpeed < 6) monkeyEnemy.speed = 6;
            else monkeyEnemy.speed = monkeySpeed;
            monkeyEnemies.push(monkeyEnemy);
            monkeyEnemyTimer = 0;
        }else monkeyEnemyTimer+=deltaTime;

        monkeyEnemies.forEach((monkey) => {
            monkey.draw(ctx);
            monkey.update(deltaTime);
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
            enemy.update(deltaTime);
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function displayStatusText(context){
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: '+score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score: '+score, 22, 52);
        if(gameOver){
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, try again', canvas.width/2, 200);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, try again!', canvas.width/2 + 2, 202);
        }
    }
    // bossTimer 
    let bossTimer = 0;
    let bossLv = 0;
    // bullet
    let bulletTimer = 0;
    let bulletInterval = 400;

    // enemy
    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    //monkeyenemy
    let monkeyEnemyTimer = 0;
    let monkeyEnemyInterval = 3000;
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
        player.update(input, deltaTime, enemies, monkeyEnemies, bosses);
        bossHandler(deltaTime);
        handleEnemies(deltaTime);
        monkeyEnemyHandler(deltaTime);
        bulletHandler(deltaTime, player, input)
        displayStatusText(ctx);
        if(!gameOver) requestAnimationFrame(animate);
    }
    animate(0);
});