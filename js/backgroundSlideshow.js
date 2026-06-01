// Background Slideshow for all pages
class BackgroundSlideshow {
    constructor() {
        this.currentSlide = 0;
        this.slideInterval = null;
        this.slides = [];
        this.heroSection = null;
    }

    init(slides) {
        this.slides = slides;
        this.heroSection = document.getElementById('heroSection');
        
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
        let slidePath = this.slides[this.currentSlide];
        
        // Log for debugging
        console.log(`BackgroundSlideshow: Showing slide ${this.currentSlide + 1}/${this.slides.length}: "${slidePath}"`);
        
        // Add fade effect class
        this.heroSection.classList.add('background-fade');
        
        // Update the image element instead of background
        const slideshowImage = document.getElementById('heroSlideshowImage');
        if (slideshowImage) {
            slideshowImage.src = slidePath;
            slideshowImage.style.opacity = '0';
            
            // Fade in the new image
            setTimeout(() => {
                slideshowImage.style.opacity = '1';
            }, 50);
        }
        
        // Remove fade effect after transition
        setTimeout(() => {
            this.heroSection.classList.remove('background-fade');
        }, 1000);
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