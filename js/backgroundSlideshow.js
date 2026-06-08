// Background Slideshow for all pages
class BackgroundSlideshow {
    constructor() {
        this.currentSlide = 0;
        this.slideInterval = null;
        this.slides = [];
        this.heroSection = null;
    }

    init(slides) {
        this.heroSection = document.getElementById('heroSection');
        this.slides = this.buildSlides(slides);
        
        console.log('BackgroundSlideshow: Initializing with', this.slides.length, 'slides');
        console.log('BackgroundSlideshow: Slides data:', this.slides);
        
        if (this.slides.length > 0 && this.heroSection) {
            this.showSlide(this.currentSlide);
            this.startSlideshow();
            
            // Pause slideshow on hover
            this.heroSection.addEventListener('mouseenter', () => {
                this.pauseSlideshow();
            });
            
            // Resume slideshow when not hovering
            this.heroSection.addEventListener('mouseleave', () => {
                this.startSlideshow();
            });
        } else {
            if (this.slides.length === 0) {
                console.warn('BackgroundSlideshow: No slides provided');
            }
            if (!this.heroSection) {
                console.warn('BackgroundSlideshow: Hero section not found');
            }
        }
    }

    showSlide(index) {
        if (this.slides.length === 0 || !this.heroSection) return;
        
        // Ensure index is within bounds
        if (index >= this.slides.length) {
            this.currentSlide = 0;
        } else if (index < 0) {
            this.currentSlide = this.slides.length - 1;
        } else {
            this.currentSlide = index;
        }
        
        // Get the current slide path
        let slidePath = this.normalizeMediaPath(this.slides[this.currentSlide]);
        
        // Log for debugging
        console.log(`BackgroundSlideshow: Showing slide ${this.currentSlide + 1}/${this.slides.length}: "${slidePath}"`);
        
        // Add fade effect class
        this.heroSection.classList.add('background-fade');
        
        // Update the image element instead of background
        const slideshowImage = document.getElementById('heroSlideshowImage');
        const slideshowVideo = this.getOrCreateVideoElement();
        if (slideshowImage) {
            if (this.isVideoPath(slidePath)) {
                slideshowImage.style.display = 'none';
                slideshowVideo.style.display = 'block';
                slideshowVideo.src = slidePath;
                slideshowVideo.style.opacity = '0';
                slideshowVideo.load();
                slideshowVideo.play().catch(() => {
                    console.warn('BackgroundSlideshow: Video autoplay was blocked');
                });
                
                setTimeout(() => {
                    slideshowVideo.style.opacity = '1';
                }, 50);
            } else {
                slideshowVideo.pause();
                slideshowVideo.style.display = 'none';
                slideshowImage.style.display = 'block';
                slideshowImage.src = slidePath;
                slideshowImage.style.opacity = '0';
                
                // Fade in the new image
                setTimeout(() => {
                    slideshowImage.style.opacity = '1';
                }, 50);
            }
        }
        
        // Remove fade effect after transition
        setTimeout(() => {
            this.heroSection.classList.remove('background-fade');
        }, 1000);
    }

    isVideoPath(path) {
        return /\.(mp4|webm|ogg|mov)$/i.test(path || '');
    }

    isSupportedMediaPath(path) {
        return /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg|mov)(\?.*)?$/i.test(path || '');
    }

    normalizeMediaPath(path) {
        if (!path) return '';
        let mediaPath = String(path).replace(/\\/g, '/').trim();
        const imagesIndex = mediaPath.toLowerCase().lastIndexOf('/images/');
        if (imagesIndex >= 0 && !/^https?:\/\//i.test(mediaPath) && !/^file:/i.test(mediaPath)) {
            mediaPath = mediaPath.slice(imagesIndex + 1);
        }
        return mediaPath.replace(/^\/+/, '');
    }

    getCurrentBackgroundPath() {
        if (!this.heroSection) return '';
        const backgroundImage = this.heroSection.style.backgroundImage || this.heroSection.style.background || '';
        const match = backgroundImage.match(/url\((['"]?)(.*?)\1\)/i);
        return match ? match[2] : '';
    }

    buildSlides(slides) {
        const allSlides = [];
        const backgroundPath = this.getCurrentBackgroundPath();
        if (backgroundPath) {
            allSlides.push(backgroundPath);
        }
        if (Array.isArray(slides)) {
            allSlides.push(...slides);
        } else if (slides) {
            allSlides.push(slides);
        }

        const seen = new Set();
        return allSlides
            .map(path => this.normalizeMediaPath(path))
            .filter(path => path && this.isSupportedMediaPath(path))
            .filter(path => {
                const key = path.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }

    getOrCreateVideoElement() {
        let video = document.getElementById('heroSlideshowVideo');
        if (!video) {
            const container = document.querySelector('.hero-slideshow-container');
            video = document.createElement('video');
            video.id = 'heroSlideshowVideo';
            video.className = 'hero-slideshow-image';
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.style.display = 'none';
            if (container) {
                container.appendChild(video);
            }
        }
        return video;
    }

    nextSlide() {
        this.showSlide(this.currentSlide + 1);
    }

    prevSlide() {
        this.showSlide(this.currentSlide - 1);
    }

    startSlideshow() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        
        // Change slide every 5 seconds
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    pauseSlideshow() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
}

// Create a global instance
const backgroundSlideshow = new BackgroundSlideshow();
