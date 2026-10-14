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

// Función robusta de detección y resolución de colisiones
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
                // Cambiar a color azul (#0000FF) durante la colisión
                c1.color = "#0000FF";
                c2.color = "#0000FF";

                if (distance === 0) continue;

                // Dirección normal de la colisión
                let nx = dx / distance;
                let ny = dy / distance;

                // 1. Corrección de posición fuerte para separarlos inmediatamente
                let overlap = minDist - distance;
                // Empujamos a cada círculo la mitad de la superposición más un pequeño margen extra
                let separation = (overlap / 2) + 0.5;
                c1.posX -= nx * separation;
                c1.posY -= ny * separation;
                c2.posX += nx * separation;
                c2.posY += ny * separation;

                // 2. Intercambio de velocidades relativas con componentes vectoriales
                let kx = c1.dx - c2.dx;
                let ky = c1.dy - c2.dy;
                let p = 2 * (nx * kx + ny * ky) / 2; // Factor de masa igual (masa = 1)

                c1.dx -= p * nx;
                c1.dy -= p * ny;
                c2.dx += p * nx;
                c2.dy += p * ny;
            }
        }
    }
}

// Función de animación principal
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar canvas
    
    checkCollisions(); // Verificar colisiones con separación garantizada

    circles.forEach(circle => {
        circle.update(ctx); // Actualizar y dibujar cada círculo
    });

    requestAnimationFrame(animate);
}

// Inicializar con 20 círculos
generateCircles(20);
animate();