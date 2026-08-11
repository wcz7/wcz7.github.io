document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll animations (Intersection Observer)
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once it's visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // 2. Navbar background change on scroll & Active link highlight
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section, footer');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let currentScroll = window.scrollY;
        
        // Navbar shadow
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active link highlight
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Add offset to trigger slightly before the section hits top
            if (currentScroll >= (sectionTop - 150) && currentScroll < (sectionTop + sectionHeight - 150)) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // 3. Smooth scrolling for anchor links (fallback for browsers that don't support scroll-behavior: smooth in CSS)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // offset for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initial check for animations if they are already in viewport on load
    setTimeout(() => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);

    // --- Galaxy Canvas Background Animation (Warp Speed Starfield) ---
    const canvas = document.getElementById('galaxy-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        let stars = [];
        const numStars = 4000; // 进一步大幅增加星星数量让背景更密集
        let centerX = width / 2;
        let centerY = height / 2;
        
        class Star {
            constructor() {
                this.reset(true);
            }
            
            reset(randomZ = false) {
                // Random position in a large 3D space
                this.x = (Math.random() - 0.5) * width * 3;
                this.y = (Math.random() - 0.5) * height * 3;
                this.z = randomZ ? Math.random() * width : width;
                this.pz = this.z;
                // Varying speeds for depth effect
                this.speed = Math.random() * 2 + 1; 
            }
            
            update() {
                this.pz = this.z;
                this.z -= this.speed;
                
                // If star passes the screen (z <= 0), reset it to far away
                if (this.z < 1) {
                    this.reset(false);
                }
            }
            
            draw() {
                // Field of view
                let fov = width;
                
                // Project 3D coordinates to 2D screen
                let sx = (this.x / this.z) * fov + centerX;
                let sy = (this.y / this.z) * fov + centerY;
                
                // Project previous 3D coordinates to 2D screen (for the streak tail)
                let px = (this.x / this.pz) * fov + centerX;
                let py = (this.y / this.pz) * fov + centerY;
                
                // Calculate size and opacity based on distance (closer = bigger and brighter)
                let zRatio = (1 - this.z / width);
                let size = zRatio * 3;
                let alpha = zRatio * 1.5; // Cap at 1.0 automatically by rgba
                
                // Draw the glowing streak (tail)
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.lineWidth = size * 0.8;
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                ctx.stroke();
                
                // Draw the star head
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                
                // Add a subtle glow for closer stars
                if (zRatio > 0.5) {
                    ctx.shadowBlur = size * 3;
                    ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.fill();
            }
        }
        
        for(let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
        
        // Setup mouse tracking to slightly shift the perspective center (parallax)
        let mouseX = centerX;
        let mouseY = centerY;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function animate() {
            // Smoothly move the vanishing point towards the mouse
            centerX += (mouseX - centerX) * 0.05;
            centerY += (mouseY - centerY) * 0.05;

            // Fill background with pure black
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000000'; 
            ctx.fillRect(0, 0, width, height);
            
            stars.forEach(star => {
                star.update();
                star.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            centerX = width / 2;
            centerY = height / 2;
        });
    }

    // --- Navbar Button Spotlight Effect ---
    navLinks.forEach(link => {
        link.addEventListener('mousemove', e => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            link.style.setProperty('--mouse-x', `${x}px`);
            link.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- Text Particle Animation for Hero Title ---
    const textCanvas = document.getElementById('text-particle-canvas');
    if (textCanvas) {
        const tCtx = textCanvas.getContext('2d', { willReadFrequently: true });
        let tWidth, tHeight;
        let textParticles = [];
        
        const offscreen = document.createElement('canvas');
        const oCtx = offscreen.getContext('2d', { willReadFrequently: true });
        
        let mouse = { x: null, y: null, radius: 50 };
        textCanvas.addEventListener('mousemove', (e) => {
            const rect = textCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        textCanvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        class TextParticle {
            constructor(x, y) {
                this.targetX = x;
                this.targetY = y;
                // Initial scattered positions
                this.x = Math.random() * tWidth;
                this.y = Math.random() * tHeight;
                this.vx = 0;
                this.vy = 0;
                this.size = 2; // Particle size
                // White color for the particles
                this.color = '#ffffff';
                this.friction = 0.85;
                this.ease = 0.05 + Math.random() * 0.05; // slightly varying ease for natural look
            }
            
            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx*dx + dy*dy);
                
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * 15;
                let directionY = forceDirectionY * force * 15;
                
                if (distance < mouse.radius && mouse.x != null) {
                    this.vx -= directionX;
                    this.vy -= directionY;
                }
                
                // Spring back to original text position
                this.vx += (this.targetX - this.x) * this.ease;
                this.vy += (this.targetY - this.y) * this.ease;
                
                this.vx *= this.friction;
                this.vy *= this.friction;
                
                this.x += this.vx;
                this.y += this.vy;
            }
            
            draw() {
                tCtx.fillStyle = this.color;
                tCtx.beginPath();
                tCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                tCtx.fill();
            }
        }
        
        function initTextParticles() {
            textParticles = [];
            // Use client dimensions to avoid scrollbar offset/scaling issues
            tWidth = textCanvas.width = textCanvas.clientWidth;
            tHeight = textCanvas.height = textCanvas.clientHeight;
            
            offscreen.width = tWidth;
            offscreen.height = tHeight;
            
            oCtx.clearRect(0, 0, tWidth, tHeight);
            oCtx.fillStyle = 'white';
            
            // Calculate font size to occupy ~95% of the screen width for maximum impact
            let targetWidth = tWidth * 0.95;
            let testFontSize = 100;
            oCtx.font = `bold ${testFontSize}px Inter, "Segoe UI", sans-serif`;
            let testWidth = oCtx.measureText('你好，我是王晨钊').width;
            
            let finalFontSize = testFontSize * (targetWidth / testWidth);
            
            // Only cap at 90% of screen height so it doesn't get cut off vertically on ultra-wide screens
            finalFontSize = Math.min(finalFontSize, tHeight * 0.9); 


            
            oCtx.font = `bold ${finalFontSize}px Inter, "Segoe UI", sans-serif`;
            oCtx.textAlign = 'center';
            oCtx.textBaseline = 'middle';
            oCtx.fillText('你好，我是王晨钊', tWidth / 2, tHeight / 2);
            
            const textData = oCtx.getImageData(0, 0, tWidth, tHeight);
            
            let step = Math.max(Math.floor(finalFontSize / 20), 4); // scale particle density with font size
            for (let y = 0; y < tHeight; y += step) {
                for (let x = 0; x < tWidth; x += step) {
                    let index = (y * tWidth + x) * 4;
                    let alpha = textData.data[index + 3];
                    
                    if (alpha > 128) {
                        textParticles.push(new TextParticle(x, y));
                    }
                }
            }
        }
        
        function animateTextParticles() {
            tCtx.clearRect(0, 0, tWidth, tHeight);
            
            for(let i = 0; i < textParticles.length; i++){
                textParticles[i].update();
                textParticles[i].draw();
            }
            requestAnimationFrame(animateTextParticles);
        }
        
        // Slight delay to ensure layout is done
        setTimeout(() => {
            initTextParticles();
            animateTextParticles();
        }, 150);
        
        window.addEventListener('resize', () => {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(() => {
                initTextParticles();
            }, 200);
        });
    }

    // --- Experience Wheel Interaction ---
    const wheelContainer = document.querySelector('.experience-wheel');
    const originalWheelItems = document.querySelectorAll('.wheel-item');
    const contentItems = document.querySelectorAll('.experience-content');

    if (wheelContainer && originalWheelItems.length > 0 && contentItems.length > 0) {
        // Clone items to have a larger pool for the continuous scrolling effect
        // We will make 3 sets of the original items (total 12)
        for (let i = 0; i < 2; i++) {
            originalWheelItems.forEach(item => {
                let clone = item.cloneNode(true);
                wheelContainer.appendChild(clone);
            });
        }
        
        const allWheelItems = document.querySelectorAll('.wheel-item');
        const total = allWheelItems.length;

        let currentWheelIndex = 0;

        allWheelItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentWheelIndex = index;
                // Determine which original content this corresponds to
                const targetContentIndex = parseInt(item.getAttribute('data-index'));
                
                // Remove active from all
                allWheelItems.forEach(w => w.classList.remove('active'));
                contentItems.forEach(c => c.classList.remove('active'));

                // Add active to clicked item and its corresponding content
                item.classList.add('active');
                if (contentItems[targetContentIndex]) {
                    contentItems[targetContentIndex].classList.add('active');
                }
                
                // Calculate 3D rotations for infinite circular wheel
                allWheelItems.forEach((w, i) => {
                    // Calculate wrapped distance
                    let dist = ((i - index + Math.floor(total / 2)) % total + total) % total - Math.floor(total / 2);
                    let absDist = Math.abs(dist);
                    
                    let translateY = dist * 45; // tighter vertical spacing
                    let rotateAngle = dist * 35; // aggressive rotation
                    
                    let scale = 1 - (absDist * 0.15); // shrinks as it goes further
                    if (scale < 0) scale = 0;
                    
                    let opacity = 0;
                    if (absDist === 0) opacity = 1;
                    else if (absDist === 1) opacity = 0.4;
                    else if (absDist === 2) opacity = 0.15;
                    else if (absDist === 3) opacity = 0.05;
                    
                    let blur = absDist * 1.5; // blur increases with distance
                    
                    w.style.transform = `translateY(${translateY}px) rotateX(${rotateAngle}deg) scale(${scale})`;
                    w.style.opacity = opacity;
                    w.style.filter = `blur(${blur}px)`;
                    w.style.zIndex = total - absDist; // Keep center items on top
                });
            });
        });
        
        // Add mouse wheel scroll interaction
        let isScrolling = false;
        wheelContainer.addEventListener('wheel', (e) => {
            e.preventDefault(); // prevent page scroll
            
            if (isScrolling) return; // throttle scrolling
            isScrolling = true;
            
            if (e.deltaY > 0) {
                // Scroll down -> go to next item
                currentWheelIndex = (currentWheelIndex + 1) % total;
            } else if (e.deltaY < 0) {
                // Scroll up -> go to previous item
                currentWheelIndex = (currentWheelIndex - 1 + total) % total;
            }
            
            allWheelItems[currentWheelIndex].click();
            
            setTimeout(() => {
                isScrolling = false;
            }, 300); // 300ms cooldown per scroll step
        });

        // Trigger initial state
        allWheelItems[0].click();
    }

    // --- Ring Gallery Interaction ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        const totalGallery = galleryItems.length;
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                galleryItems.forEach(w => w.classList.remove('active'));
                item.classList.add('active');
                
                galleryItems.forEach((w, i) => {
                    let dist = ((i - index + Math.floor(totalGallery / 2)) % totalGallery + totalGallery) % totalGallery - Math.floor(totalGallery / 2);
                    let absDist = Math.abs(dist);
                    
                    // Parameters for the 3D ring layout
                    let translateX = dist * 220; // horizontal spacing
                    let rotateAngle = dist * -20; // angle inward
                    let translateZ = -absDist * 150; // depth
                    
                    let scale = 1 - (absDist * 0.05); 
                    
                    let opacity = 1 - (absDist * 0.25);
                    if (opacity < 0) opacity = 0;
                    
                    w.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateAngle}deg) scale(${scale})`;
                    w.style.zIndex = totalGallery - absDist;
                    w.style.opacity = opacity;
                });
            });
        });
        
        // Initial state (center item)
        galleryItems[Math.floor(totalGallery/2)].click();
    }
});