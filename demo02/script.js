// https://youtu.be/5dIbK0auaB8

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  /** @param {Effect} effect */
  constructor(effect) {
    this.effect = effect;
    this.radius = Math.floor(Math.random() * 15 + 10);
    this.buffer = this.radius * 4;
    this.reset();
    this.vx = Math.random() * 1 - 0.5;
    this.vy = Math.random() * 1 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.9;
  }
  reset() {
    this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
  }
  /** @param {CanvasRenderingContext2D} context */
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }
  update() {
    if (this.effect.mouse.pressed) {
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = this.effect.mouse.radius / distance;
      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.sin(angle) * force;
      }
    }

    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += (this.pushY *= this.friction) + this.vy;
    if (this.x < this.buffer) {
      this.x = this.buffer;
      this.vx *= -1;
    } else if (this.x > this.effect.width - this.buffer) {
      this.x = this.effect.width - this.buffer;
      this.vx *= -1;
    }
    if (this.y < this.buffer) {
      this.y = this.buffer;
      this.vy *= -1;
    } else if (this.y > this.effect.height - this.buffer) {
      this.y = this.effect.height - this.buffer;
      this.vy *= -1;
    }
  }
}

class Effect {
  /** @param {HTMLCanvasElement} canvas  */
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    /** @type {Particle[]} */
    this.particles = [];
    this.numberOfParticles = 400;
    this.initContext();
    this.createParticles();

    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 250,
    };

    window.addEventListener('resize', e => {
      this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
    });
    window.addEventListener('mousemove', e => {
      if (this.mouse.pressed) {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      }
    });
    window.addEventListener('mousedown', e => {
      this.mouse.pressed = true;
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    window.addEventListener('mouseup', e => {
      this.mouse.pressed = false;
    });
  }
  initContext() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
  }
  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }
  handleParticles(context) {
    this.connectParticles(context);
    this.particles.forEach(particle => {
      particle.draw(context);
      particle.update();
    });
  }
  /** @param {CanvasRenderingContext2D} context */
  connectParticles(context) {
    const maxDistance = 100;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);
        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance;
          context.globalAlpha = opacity;
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.stroke();
          context.restore();
        }
      }
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.initContext();
    this.particles.forEach(particle => particle.reset());
  }
}

const effect = new Effect(canvas);
effect.handleParticles(ctx);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}
animate();
