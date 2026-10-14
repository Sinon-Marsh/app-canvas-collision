const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color;
        this.text = text;
        this.speed = speed;
        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);

        // Actualizar posición X y rebotar en los bordes
        this.posX += this.dx;
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
            this.posX = Math.max(this.radius, Math.min(window_width - this.radius, this.posX));
        }

        // Actualizar posición Y y rebotar en los bordes
        this.posY += this.dy;
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
            this.posY = Math.max(this.radius, Math.min(window_height - this.radius, this.posY));
        }
    }
}

let circles = [];

function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20;
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        let speed = Math.random() * 4 + 1;
        let text = `cs${i + 1}`;
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

function checkCollisions() {
    // Restablecer el color original de todos los círculos
    circles.forEach(circle => {
        circle.color = circle.originalColor;
    });

    // 1. Resolver superposiciones (Separación estricta de posiciones)
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let c1 = circles[i];
            let c2 = circles[j];

            let dx = c2.posX - c1.posX;
            let dy = c2.posY - c1.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let minDist = c1.radius + c2.radius;

            if (distance < minDist) {
                // Marcar ambos en azul por colisión
                c1.color = "#0000FF";
                c2.color = "#0000FF";

                if (distance === 0) continue;

                // Empuje correctivo inmediato para evitar que se queden pegados
                let overlap = minDist - distance;
                let nx = dx / distance;
                let ny = dy / distance;

                // Separar proporcionalmente a cada círculo
                c1.posX -= nx * overlap * 0.5;
                c1.posY -= ny * overlap * 0.5;
                c2.posX += nx * overlap * 0.5;
                c2.posY += ny * overlap * 0.5;

                // Intercambio de velocidades elásticas simples pero efectivas
                let tempDx = c1.dx;
                let tempDy = c1.dy;
                c1.dx = c2.dx;
                c1.dy = c2.dy;
                c2.dx = tempDx;
                c2.dy = tempDy;
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    
    checkCollisions();

    circles.forEach(circle => {
        circle.update(ctx);
    });

    requestAnimationFrame(animate);
}

generateCircles(20);
animate();