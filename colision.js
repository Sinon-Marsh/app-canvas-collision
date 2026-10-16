const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');
const contadorDiv = document.getElementById('contador');

let objetosEliminadas = 0;
const totalObjetos = 25;
let objetos = [];

// Función para obtener los rangos de velocidad según las reglas de la práctica
function obtenerVelocidadBase() {
    if (objetosEliminadas > 20) {
        return { vyMin: 4.5, vyMax: 7.5 };   // iii. Contador > 20: velocidad alta
    } else if (objetosEliminadas > 10) {
        return { vyMin: 2.5, vyMax: 4.5 };   // ii. Contador > 10: velocidad media
    } else {
        return { vyMin: 1.0, vyMax: 2.2 };   // i. Inicio: velocidad inicial predefinida
    }
}

// Clase para los objetos (Flores independientes)
class ObjetoCaida {
    constructor() {
        this.reiniciar();
    }

    reiniciar() {
        this.radio = Math.random() * 12 + 16; 
        this.x = Math.random() * (canvas.width - this.radio * 2) + this.radio;
        this.y = -this.radio * (Math.random() * 5 + 2); // Alturas iniciales escalonadas para que no caigan juntas
        
        // Asignar velocidad independiente según el nivel actual
        const vel = obtenerVelocidadBase();
        this.vy = Math.random() * (vel.vyMax - vel.vyMin) + vel.vyMin;
        this.vx = (Math.random() - 0.5) * 1.5; 
        this.gravedad = 0.18;
        this.botes = 0; 
        
        // Colores llamativos
        const colores = ['#ff7979', '#badc58', '#7ed6df', '#e056fd', '#f6e58d', '#ffbe76', '#ff9ff3'];
        this.color = colores[Math.floor(Math.random() * colores.length)];
    }

    actualizar() {
        this.vy += this.gravedad;
        this.y += this.vy;
        this.x += this.vx;

        // Rebote en los bordes laterales
        if (this.x - this.radio < 0 || this.x + this.radio > canvas.width) {
            this.vx *= -1;
        }

        // Rebote en el límite inferior del canvas (suelo) generando parábola
        if (this.y + this.radio >= canvas.height) {
            this.y = canvas.height - this.radio; 
            this.vy *= -0.5; // Rebote con pérdida de energía
            this.botes++;

            // Si rebota más de 3 veces o pierde fuerza, regresa arriba de forma independiente
            if (this.botes > 3 || Math.abs(this.vy) < 1.0) {
                this.reiniciar();
            }
        }
    }

    dibujar() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Dibujar pétalos de la flor
        ctx.fillStyle = this.color;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(0, -this.radio * 0.6, this.radio * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.rotate((Math.PI * 2) / 5);
        }
        
        // Centro de la flor
        ctx.fillStyle = '#f9ca24';
        ctx.beginPath();
        ctx.arc(0, 0, this.radio * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Inicializar los 25 objetos requeridos distribuidos por todo el canvas al inicio
function inicializarObjetos() {
    objetos = [];
    for (let i = 0; i < totalObjetos; i++) {
        let obj = new ObjetoCaida();
        obj.y = Math.random() * canvas.height; // Distribuir verticalmente al arranque
        objetos.push(obj);
    }
}

// Detección de clic izquierdo del mouse (¡Elimina SOLO la flor presionada de forma independiente!)
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let i = objetos.length - 1; i >= 0; i--) {
        const obj = objetos[i];
        const distancia = Math.hypot(mouseX - obj.x, mouseY - obj.y);

        if (distancia < obj.radio) {
            objetosEliminadas++;
            contadorDiv.textContent = `Eliminadas: ${objetosEliminadas}`;
            
            // Si al eliminar cruzamos el umbral 10 o 20, aplicamos un impulso gradual y sutil a las demás sin sincronizarlas
            if (objetosEliminadas === 11 || objetosEliminadas === 21) {
                const nuevaVel = obtenerVelocidadBase();
                objetos.forEach(o => {
                    if (o.vy < nuevaVel.vyMin) {
                        o.vy = nuevaVel.vyMin + Math.random();
                    }
                });
            }

            // Reemplazar UNICAMENTE la flor eliminada por una nueva arriba
            objetos[i] = new ObjetoCaida();
            break; // Salir del ciclo para afectar solo un objeto por clic
        }
    }
});

// Bucle principal de animación
function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objetos.forEach(obj => {
        obj.actualizar();
        obj.dibujar();
    });

    requestAnimationFrame(animar);
}

// Ejecutar aplicación
inicializarObjetos();
animar();