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

        // Actualizar la posición X y rebotar en los bordes del canvas
        this.posX += this.dx;
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Actualizar la posición Y y rebotar en los bordes del canvas
        this.posY += this.dy;
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }
}

// Crear un array para almacenar los círculos
let circles = [];

// Función para generar 20 círculos aleatorios
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

// Función de colisión con física elástica 2D (Normal, Tangente y Separación)
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
            let minDist = c1.radius + c2.radius;

            // Si la distancia es menor a la suma de los radios, hay colisión
            if (distance < minDist) {
                // Cambiar a color azul (#0000FF) durante el contacto
                c1.color = "#0000FF";
                c2.color = "#0000FF";

                if (distance === 0) continue;

                // 1. Vectores normal y tangente
                let nx = dx / distance;
                let ny = dy / distance;
                let tx = -ny;
                let ty = nx;

                // 2. Corrección de posición (Separa los círculos para eliminar el solapamiento)
                let overlap = minDist - distance;
                c1.posX -= nx * overlap * 0.5;
                c1.posY -= ny * overlap * 0.5;
                c2.posX += nx * overlap * 0.5;
                c2.posY += ny * overlap * 0.5;

                // 3. Proyección de velocidades sobre los vectores tangente y normal
                let dpTan1 = c1.dx * tx + c1.dy * ty;
                let dpTan2 = c2.dx * tx + c2.dy * ty;

                let dpNorm1 = c1.dx * nx + c1.dy * ny;
                let dpNorm2 = c2.dx * nx + c2.dy * ny;

                // 4. Conservación de momento 1D en la dirección normal (masas iguales)
                let momentum1 = dpNorm2;
                let momentum2 = dpNorm1;

                // 5. Actualizar vectores de velocidad finales
                c1.dx = tx * dpTan1 + nx * momentum1;
                c1.dy = ty * dpTan1 + ny * momentum1;
                c2.dx = tx * dpTan2 + nx * momentum2;
                c2.dy = ty * dpTan2 + ny * momentum2;
            }
        }
    }
}

// Función de animación principal
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar canvas
    
    checkCollisions(); // Verificar colisiones con física 2D

    circles.forEach(circle => {
        circle.update(ctx); // Actualizar y dibujar cada círculo
    });

    requestAnimationFrame(animate);
}

// Inicializar con 20 círculos
generateCircles(20);
animate();