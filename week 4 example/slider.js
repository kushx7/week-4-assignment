/**
 * Image Slider Library (Vanilla JavaScript)
 * Implements fluid horizontal sliding, dynamic indicator dots,
 * and seamless infinite boundary looping using clone buffering.
 */
class Slider {
  constructor(containerSelector) {
    // Cache DOM Elements
    this.container = document.querySelector(containerSelector);
    this.track = this.container.querySelector('.slider-track');
    this.slides = Array.from(this.track.children);
    this.prevBtn = this.container.querySelector('.prev-btn');
    this.nextBtn = this.container.querySelector('.next-btn');
    this.dotsContainer = this.container.querySelector('.slider-dots');

    // State Variables
    this.totalSlides = this.slides.length;
    this.currentIndex = 0;        // Logical slide index (0 to totalSlides - 1)
    this.trackIndex = 1;          // Physical track index (includes clones)
    this.isTransitioning = false; // Lock flag to prevent rapid-click glitches

    this.init();
  }

  init() {
    this.setupClones();
    this.createDots();
    this.bindEvents();
    this.updateSlider(false);
  }

  // 1. Clone first and last slides for seamless infinite loop
  setupClones() {
    const firstClone = this.slides[0].cloneNode(true);
    const lastClone = this.slides[this.totalSlides - 1].cloneNode(true);

    firstClone.classList.add('clone');
    lastClone.classList.add('clone');

    // Append first slide to end; Prepend last slide to beginning
    this.track.appendChild(firstClone);
    this.track.insertBefore(lastClone, this.track.firstElementChild);
  }

  // 2. Generate dynamic indicator dots based on slide count
  createDots() {
    this.dotsContainer.innerHTML = '';
    this.dots = [];

    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.classList.add('active');

      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
  }

  // 3. Update track position using hardware-accelerated CSS transform
  updateSlider(animated = true) {
    this.track.style.transition = animated ? 'transform 0.5s ease-in-out' : 'none';
    this.track.style.transform = `translateX(-${this.trackIndex * 100}%)`;
    this.updateDots();
  }

  // Update active state styling on indicator dots
  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  // Slide to next image
  next() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.trackIndex++;
    this.currentIndex = (this.trackIndex - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlider(true);
  }

  // Slide to previous image
  prev() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.trackIndex--;
    this.currentIndex = (this.trackIndex - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlider(true);
  }

  // Direct navigation to specific slide via dot click
  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;
    this.isTransitioning = true;
    this.currentIndex = index;
    this.trackIndex = index + 1;
    this.updateSlider(true);
  }

  // 4. Boundary wrapping: reset position invisibly when reaching clones
  handleTransitionEnd() {
    // Passed last slide onto firstClone -> snap back to real first slide
    if (this.trackIndex === this.totalSlides + 1) {
      this.trackIndex = 1;
      this.updateSlider(false);
    }
    // Passed first slide onto lastClone -> snap back to real last slide
    else if (this.trackIndex === 0) {
      this.trackIndex = this.totalSlides;
      this.updateSlider(false);
    }
    this.isTransitioning = false;
  }

  // Bind event listeners to UI controls
  bindEvents() {
    this.nextBtn.addEventListener('click', () => this.next());
    this.prevBtn.addEventListener('click', () => this.prev());
    this.track.addEventListener('transitionend', () => this.handleTransitionEnd());

    // Keyboard navigation (Left / Right arrow keys)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    });
  }
}

// Initialize slider once DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new Slider('.slider-container');
});
