const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
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

        // Actualizar la posición X
        this.posX += this.dx;
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Actualizar la posición Y
        this.posY += this.dy;
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }
}

let circles = [];

function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5 unidades
        let text = `cs${i + 1}`;
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

function checkCollisions() {
    // Restablecer el color original de todos los círculos en cada fotograma
    circles.forEach(circle => {
        circle.color = circle.originalColor;
    });

    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let c1 = circles[i];
            let c2 = circles[j];

            let dx = c2.posX - c1.posX;
            let dy = c2.posY - c1.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Detección de colisión por distancia entre centros
            if (distance < c1.radius + c2.radius) {
                // Flashear en color azul (#0000FF)
                c1.color = "#0000FF";
                c2.color = "#0000FF";

                // Cambio de dirección (rebote opuesto)
                c1.dx = -c1.dx;
                c1.dy = -c1.dy;
                c2.dx = -c2.dx;
                c2.dy = -c2.dy;
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

// Generar 20 círculos para la versión final local (3.0)
generateCircles(20); 
animate();