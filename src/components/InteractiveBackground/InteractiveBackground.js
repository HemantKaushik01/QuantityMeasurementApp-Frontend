import React, { useEffect, useRef } from 'react';
import './InteractiveBackground.css';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Mouse tracking
    let mouse = {
      x: undefined,
      y: undefined,
      radius: 180
    };

    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = undefined;
      mouse.y = undefined;
    };

    let resizeTimeout;
    const handleResize = () => {
      // Debounce resize
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('resize', handleResize);

    class Particle {
      constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.size = 1.8;
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * 6 + 4; // length of the dash
        
        // Colors matching a vibrant theme
        const colors = [
          'rgba(79, 70, 229, OPACITY)',   // Indigo primary
          'rgba(168, 85, 247, OPACITY)',  // Purple
          'rgba(236, 72, 153, OPACITY)',  // Pink
          'rgba(59, 130, 246, OPACITY)',  // Blue
          'rgba(20, 184, 166, OPACITY)',  // Teal
          'rgba(244, 63, 94, OPACITY)'    // Rose
        ];
        this.colorTemplate = colors[Math.floor(Math.random() * colors.length)];
      }

      draw(ctx) {
        let distance = 9999;
        if (mouse.x !== undefined && mouse.y !== undefined) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          distance = Math.sqrt(dx * dx + dy * dy);
        }

        // Opacity mapping (further away = dimmer)
        let opacity = 0.15; // default baseline opacity
        if (distance < mouse.radius * 2) {
          // If close to cursor, brighten up smoothly up to 1
          opacity = 0.15 + (1 - distance / (mouse.radius * 2)) * 0.85; 
        }

        ctx.strokeStyle = this.colorTemplate.replace('OPACITY', opacity.toFixed(2));
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        
        let currentAngle = this.angle;
        // Shift angle based on mouse interaction to trace a swirl
        if (distance < mouse.radius) {
           const dx = mouse.x - this.x;
           const dy = mouse.y - this.y;
           const mouseAngle = Math.atan2(dy, dx);
           currentAngle = mouseAngle + Math.PI / 2; // Perpendicular to force
        }

        const endX = this.x + Math.cos(currentAngle) * this.length;
        const endY = this.y + Math.sin(currentAngle) * this.length;
        
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      update() {
        let distance = 9999;
        let dx = 0, dy = 0;
        
        if (mouse.x !== undefined && mouse.y !== undefined) {
           dx = mouse.x - this.x;
           dy = mouse.y - this.y;
           distance = Math.sqrt(dx * dx + dy * dy);
        }

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          const pushX = forceDirectionX * force * 5; // repulsive force multiplier
          const pushY = forceDirectionY * force * 5;
          
          this.x -= pushX;
          this.y -= pushY;
        } else {
          // Spring back slowly to the base offset
          if (this.x !== this.baseX) {
            this.x -= (this.x - this.baseX) * 0.05;
          }
          if (this.y !== this.baseY) {
            this.y -= (this.y - this.baseY) * 0.05;
          }
        }
      }
    }

    function init() {
      particles = [];
      const spacing = 35; // Size of grid cell
      for (let y = 0; y < canvas.height + spacing; y += spacing) {
        for (let x = 0; x < canvas.width + spacing; x += spacing) {
          // Slight offsets so it looks organic, not a perfect grid
          const offsetX = (Math.random() - 0.5) * spacing * 0.8;
          const offsetY = (Math.random() - 0.5) * spacing * 0.8;
          particles.push(new Particle(x + offsetX, y + offsetY));
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw a subtle soft glow exactly at the mouse position
      if (mouse.x !== undefined && mouse.y !== undefined) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.03)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    // Initialize immediately instead of depending on resize event
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-background" />;
};

export default InteractiveBackground;
