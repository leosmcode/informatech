// Configurações globais
const CONFIG = {
    animationDuration: 600,
    scrollOffset: 100,
    typingSpeed: 50,
    counterDuration: 2000
};

// Utilitários
const Utils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    isElementInViewport: (el, offset = 0) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= -offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    easeInOutCubic: (t) => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
};

// Preloader
class Preloader {
    constructor() {
        this.preloader = document.querySelector('.preloader');
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            this.hide();
        });
    }

    hide() {
        if (this.preloader) {
            this.preloader.style.opacity = '0';
            setTimeout(() => {
                this.preloader.style.display = 'none';
            }, 300);
        }
    }
}

// Navegação
class Navigation {
    constructor() {
        this.header = document.querySelector('.header');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-menu a');
        this.scrollIndicator = document.querySelector('.hero-scroll-indicator');
        
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupActiveLinks();
        this.setupSmoothScrolling();
        this.setupScrollIndicator();
    }

    setupMobileMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                this.hamburger.classList.toggle('active');
                this.navMenu.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Fechar menu ao clicar em um link
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.hamburger.classList.remove('active');
                    this.navMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });

            // Fechar menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
                    this.hamburger.classList.remove('active');
                    this.navMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        }
    }

    setupScrollEffects() {
        const handleScroll = Utils.throttle(() => {
            if (window.scrollY > 100) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    setupActiveLinks() {
        const handleScroll = Utils.throttle(() => {
            const sections = document.querySelectorAll('section[id]');
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - CONFIG.scrollOffset) {
                    current = section.getAttribute('id');
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const targetPosition = target.offsetTop - 80;
                    this.smoothScrollTo(targetPosition);
                }
            });
        });
    }

    setupScrollIndicator() {
        if (this.scrollIndicator) {
            this.scrollIndicator.addEventListener('click', () => {
                const firstSection = document.querySelector('#quem-somos');
                if (firstSection) {
                    const targetPosition = firstSection.offsetTop - 80;
                    this.smoothScrollTo(targetPosition);
                }
            });
        }
    }

    smoothScrollTo(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let start = null;

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = Utils.easeInOutCubic(timeElapsed / duration) * distance + startPosition;
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }
}

// Animações de entrada
class AnimationObserver {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupCounterAnimations();
        this.setupParallaxEffect();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, this.observerOptions);

        // Aplicar animação aos elementos
        const animatedElements = document.querySelectorAll('.feature-card, .stat-item, .tech-item, .contact-card, .credential-item');
        
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity ${CONFIG.animationDuration}ms ease, transform ${CONFIG.animationDuration}ms ease`;
            observer.observe(el);
        });
    }

    setupCounterAnimations() {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.textContent.replace(/\D/g, ''));
                        this.animateCounter(stat, target);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.quem-somos-stats');
        const heroStats = document.querySelector('.hero-stats');
        
        if (statsSection) statsObserver.observe(statsSection);
        if (heroStats) statsObserver.observe(heroStats);
    }

    animateCounter(element, target, duration = CONFIG.counterDuration) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const updateCounter = () => {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start) + (target > 100 ? '+' : '');
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + (target > 100 ? '+' : '');
            }
        };
        
        updateCounter();
    }

    setupParallaxEffect() {
        const hero = document.querySelector('.hero');
        const heroParticles = document.querySelector('.hero-particles');
        
        if (hero && heroParticles) {
            const handleScroll = Utils.throttle(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                heroParticles.style.transform = `translateY(${rate}px)`;
            }, 10);

            window.addEventListener('scroll', handleScroll);
        }
    }
}

// Carrossel de tecnologias
class TechCarousel {
    constructor() {
        this.carrosselTrack = document.querySelector('.carrossel-track');
        this.techItems = document.querySelectorAll('.tech-item');
        this.init();
    }

    init() {
        console.log('Inicializando carrossel...');
        
        // Garantir que o carrossel esteja visível desde o início
        if (this.carrosselTrack) {
            this.carrosselTrack.style.display = 'flex';
            this.carrosselTrack.style.opacity = '1';
            this.carrosselTrack.style.visibility = 'visible';
            this.carrosselTrack.style.transform = 'translateX(0)';
        }
        
        this.setupHoverEffects();
        this.setupTooltips();
        this.duplicateItems();
        this.forceAnimation();
        
        // Debug: verificar se o elemento existe
        if (this.carrosselTrack) {
            console.log('Carrossel track encontrado:', this.carrosselTrack);
            console.log('Número de itens:', this.carrosselTrack.children.length);
        } else {
            console.log('Carrossel track NÃO encontrado!');
        }
    }

    forceAnimation() {
        if (this.carrosselTrack) {
            // Garantir que o carrossel esteja visível e posicionado corretamente
            this.carrosselTrack.style.display = 'flex';
            this.carrosselTrack.style.opacity = '1';
            this.carrosselTrack.style.visibility = 'visible';
            this.carrosselTrack.style.transform = 'translateX(0)';
            
            // Garantir que todos os itens estejam visíveis
            const allTechItems = this.carrosselTrack.querySelectorAll('.tech-item');
            allTechItems.forEach(item => {
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
                item.style.visibility = 'visible';
            });
            
            // Garantir que todas as imagens estejam visíveis
            const allImages = this.carrosselTrack.querySelectorAll('.tech-item img');
            allImages.forEach(img => {
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            });
            
            // Remover animação existente
            this.carrosselTrack.style.animation = 'none';
            
            // Forçar reflow
            this.carrosselTrack.offsetHeight;
            
            // Aplicar nova animação
            this.carrosselTrack.style.animation = 'scroll 60s linear infinite';
            
            // Verificar se a animação foi aplicada
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(this.carrosselTrack);
                if (computedStyle.animationName === 'none' || computedStyle.animationName === '') {
                    // Se a animação não foi aplicada, tentar novamente
                    this.carrosselTrack.style.animation = 'scroll 60s linear infinite';
                }
                console.log('Animação aplicada:', computedStyle.animationName);
            }, 100);
            
            // Adicionar evento para reiniciar animação
            this.carrosselTrack.addEventListener('animationend', () => {
                this.carrosselTrack.style.animation = 'none';
                this.carrosselTrack.offsetHeight;
                this.carrosselTrack.style.animation = 'scroll 60s linear infinite';
            });
        }
    }

    setupHoverEffects() {
        if (this.carrosselTrack) {
            this.carrosselTrack.addEventListener('mouseenter', () => {
                this.carrosselTrack.style.animationPlayState = 'paused';
            });
            
            this.carrosselTrack.addEventListener('mouseleave', () => {
                this.carrosselTrack.style.animationPlayState = 'running';
            });
        }
    }

    setupTooltips() {
        this.techItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.currentTarget);
            });
            
            item.addEventListener('mouseleave', (e) => {
                this.hideTooltip(e.currentTarget);
            });
        });
    }

    showTooltip(item) {
        const tooltip = document.createElement('div');
        const techName = item.querySelector('span').textContent;
        
        tooltip.className = 'tech-tooltip';
        tooltip.textContent = `Especialistas em ${techName}`;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--gray-900);
            color: var(--white);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            z-index: 1000;
            pointer-events: none;
            transform: translateY(-40px);
            opacity: 0;
            transition: opacity 0.3s ease;
            white-space: nowrap;
        `;
        
        item.style.position = 'relative';
        item.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
    }

    hideTooltip(item) {
        const tooltip = item.querySelector('.tech-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.remove();
            }, 300);
        }
    }

    duplicateItems() {
        if (this.carrosselTrack) {
            const items = Array.from(this.carrosselTrack.children);
            
            // Duplicar todos os itens 2 vezes para criar um loop infinito perfeito
            for (let i = 0; i < 2; i++) {
                items.forEach(item => {
                    const clone = item.cloneNode(true);
                    this.carrosselTrack.appendChild(clone);
                });
            }
            
            // Garantir que todos os itens tenham a mesma largura e posição
            const allTechItems = this.carrosselTrack.querySelectorAll('.tech-item');
            allTechItems.forEach(item => {
                item.style.width = '160px';
                item.style.minWidth = '160px';
                item.style.maxWidth = '160px';
                item.style.flexShrink = '0';
                item.style.flexGrow = '0';
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
                item.style.visibility = 'visible';
            });
            
            console.log('Itens duplicados. Total:', this.carrosselTrack.children.length);
            
            // Garantir que as imagens estejam visíveis
            const allImages = this.carrosselTrack.querySelectorAll('.tech-item img');
            allImages.forEach(img => {
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            });
            
            // Iniciar animação manual se a CSS não funcionar
            this.startManualAnimation();
        }
    }
    
    startManualAnimation() {
        if (!this.carrosselTrack) return;
        
        let position = 0;
        const speed = 1; // pixels por frame
        const itemWidth = 160; // largura fixa de cada item
        const gap = 32; // gap entre itens (2rem = 32px)
        const totalItemWidth = itemWidth + gap;
        const totalWidth = (this.carrosselTrack.children.length / 3) * totalItemWidth; // Dividir por 3 para loop perfeito
        
        const animate = () => {
            position -= speed;
            if (position <= -totalWidth) {
                position = 0;
            }
            
            this.carrosselTrack.style.transform = `translateX(${position}px)`;
            requestAnimationFrame(animate);
        };
        
        // Verificar se a animação CSS está funcionando após 1 segundo
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(this.carrosselTrack);
            if (computedStyle.animationName === 'none' || computedStyle.animationName === '') {
                console.log('Iniciando animação manual');
                this.carrosselTrack.style.animation = 'none';
                animate();
            }
        }, 1000);
    }
}

// Formulário de contato
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitButton = document.querySelector('.submit-button');
        this.init();
    }

    init() {
        if (this.form) {
            this.setupFormValidation();
            this.setupFormSubmission();
            this.setupInputEffects();
        }
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remover erro anterior
        this.clearFieldError(field);

        // Validações específicas
        switch (fieldName) {
            case 'nome':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Nome é obrigatório';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'E-mail é obrigatório';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'E-mail inválido';
                }
                break;

            case 'telefone':
                if (value && value.length < 10) {
                    isValid = false;
                    errorMessage = 'Telefone inválido';
                }
                break;

            case 'servico':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Selecione um serviço';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#ef4444';
        
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.style.borderColor = 'var(--gray-200)';
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        // Validar todos os campos
        const inputs = this.form.querySelectorAll('input[required], select[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        // Mostrar loading
        this.setSubmitButtonLoading(true);

        try {
            // Simular envio (substituir por integração real)
            await this.simulateFormSubmission();
            
            this.showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            this.form.reset();
        } catch (error) {
            this.showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
        } finally {
            this.setSubmitButtonLoading(false);
        }
    }

    async simulateFormSubmission() {
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }

    setSubmitButtonLoading(loading) {
        if (loading) {
            this.submitButton.innerHTML = `
                <div class="spinner" style="width: 20px; height: 20px; margin-right: 0.5rem;"></div>
                <span>Enviando...</span>
            `;
            this.submitButton.disabled = true;
        } else {
            this.submitButton.innerHTML = `
                <span>Enviar Mensagem</span>
                <i class="fas fa-paper-plane"></i>
            `;
            this.submitButton.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
            box-shadow: var(--shadow-lg);
        `;

        // Cores baseadas no tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    setupInputEffects() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentNode.classList.remove('focused');
                }
            });
        });
    }
}

// Efeitos visuais avançados
class VisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupTechVisualization();
        this.setupImageLoadingEffects();
        this.setupHoverEffects();
    }

    setupTechVisualization() {
        const techCircles = document.querySelectorAll('.tech-circle');
        
        techCircles.forEach((circle, index) => {
            // Animação de entrada escalonada
            setTimeout(() => {
                circle.style.opacity = '1';
                circle.style.transform = circle.classList.contains('main') 
                    ? 'translate(-50%, -50%) scale(1)' 
                    : 'scale(1)';
            }, index * 200);

            // Efeito de hover
            circle.addEventListener('mouseenter', () => {
                circle.style.transform = circle.classList.contains('main')
                    ? 'translate(-50%, -50%) scale(1.1)'
                    : 'scale(1.1)';
            });

            circle.addEventListener('mouseleave', () => {
                circle.style.transform = circle.classList.contains('main')
                    ? 'translate(-50%, -50%) scale(1)'
                    : 'scale(1)';
            });
        });

        // Inicializar com opacity 0
        techCircles.forEach(circle => {
            circle.style.opacity = '0';
            circle.style.transform = circle.classList.contains('main')
                ? 'translate(-50%, -50%) scale(0.8)'
                : 'scale(0.8)';
            circle.style.transition = 'all 0.5s ease';
        });
    }

    setupImageLoadingEffects() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        });
    }

    setupHoverEffects() {
        // Efeito de hover para cards
        const cards = document.querySelectorAll('.feature-card, .contact-card, .stat-item');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
}

// Otimizações de performance
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupReducedMotion();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    setupImageOptimization() {
        // Otimizar imagens baseado na densidade de pixels
        if (window.devicePixelRatio > 1) {
            const images = document.querySelectorAll('img[data-src-2x]');
            images.forEach(img => {
                img.src = img.dataset.src2x;
            });
        }
    }

    setupReducedMotion() {
        // Respeitar preferências de movimento reduzido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-fast', '0.01ms');
            document.documentElement.style.setProperty('--transition-normal', '0.01ms');
            document.documentElement.style.setProperty('--transition-slow', '0.01ms');
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todas as classes
    new Preloader();
    new Navigation();
    new AnimationObserver();
    new TechCarousel();
    new ContactForm();
    new VisualEffects();
    new PerformanceOptimizer();

    // Adicionar classe de carregamento completo
    document.body.classList.add('loaded');
    
    // Verificação adicional do carrossel
    setTimeout(() => {
        const carrosselTrack = document.querySelector('.carrossel-track');
        if (carrosselTrack) {
            // Garantir que o carrossel esteja visível
            carrosselTrack.style.display = 'flex';
            carrosselTrack.style.opacity = '1';
            carrosselTrack.style.visibility = 'visible';
            
            // Forçar a animação
            carrosselTrack.style.animation = 'none';
            carrosselTrack.offsetHeight;
            carrosselTrack.style.animation = 'scroll 60s linear infinite';
            
            // Verificar se está funcionando
            const computedStyle = window.getComputedStyle(carrosselTrack);
            console.log('Animação aplicada:', computedStyle.animationName);
            
            // Verificar se os itens estão visíveis
            const techItems = carrosselTrack.querySelectorAll('.tech-item');
            console.log('Número de itens visíveis:', techItems.length);
            techItems.forEach((item, index) => {
                item.style.display = 'flex';
                item.style.opacity = '1';
                item.style.visibility = 'visible';
            });
        } else {
            console.log('Carrossel track não encontrado!');
        }
    }, 1000);
});

// Tratamento de erros global
window.addEventListener('error', (e) => {
    console.error('Erro JavaScript:', e.error);
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(registrationError => {
                console.log('SW falhou:', registrationError);
            });
    });
}

