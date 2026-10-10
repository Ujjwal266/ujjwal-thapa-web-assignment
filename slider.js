
/*
 * Image Slider Library
 * Author: Ujjwal Thapa
 * Features: Dynamic dots, smooth sliding, infinite looping.
 */

class ImageSlider {
    constructor(root) {
        this.root = root;
        this.track = root.querySelector("[data-track]");
        this.previousButton = root.querySelector("[data-previous]");
        this.nextButton = root.querySelector("[data-next]");
        this.dotsContainer = root.querySelector("[data-dots]");
        this.counter = root.querySelector("[data-counter]");

        this.originalSlides = Array.from(this.track.children);
        this.slideCount = this.originalSlides.length;

        this.index = 1;
        this.isTransitioning = false;
        this.resizeFrame = null;

        if (this.slideCount === 0) {
            return;
        }

        this.setup();
    }

    setup() {
        // Clone boundary slides for seamless looping.
        const firstClone = this.originalSlides[0].cloneNode(true);
        const lastClone =
            this.originalSlides[this.slideCount - 1].cloneNode(true);

        firstClone.setAttribute("aria-hidden", "true");
        lastClone.setAttribute("aria-hidden", "true");

        firstClone.querySelector("img")?.setAttribute("alt", "");
        lastClone.querySelector("img")?.setAttribute("alt", "");

        this.track.prepend(lastClone);
        this.track.append(firstClone);

        // Create one indicator for every original slide.
        this.createDots();

        // Connect navigation controls.
        this.previousButton.addEventListener("click", () => {
            this.goTo(this.index - 1);
        });

        this.nextButton.addEventListener("click", () => {
            this.goTo(this.index + 1);
        });

        // Complete the loop after reaching a cloned slide.
        this.track.addEventListener("transitionend", (event) => {
            if (event.target !== this.track ||
                event.propertyName !== "transform") {
                return;
            }

            this.isTransitioning = false;

            if (this.index === 0) {
                this.index = this.slideCount;
                this.jumpToCurrentSlide();
            } else if (this.index === this.slideCount + 1) {
                this.index = 1;
                this.jumpToCurrentSlide();
            }

            this.updateInterface();
        });

        // Recalculate the position if the viewport changes size.
        window.addEventListener("resize", () => {
            cancelAnimationFrame(this.resizeFrame);

            this.resizeFrame = requestAnimationFrame(() => {
                this.jumpToCurrentSlide();
            });
        });

        this.jumpToCurrentSlide();
        this.updateInterface();
    }

    createDots() {
        this.dotsContainer.replaceChildren();

        this.dots = this.originalSlides.map((slide, slideIndex) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.setAttribute(
                "aria-label",
                `Go to image ${slideIndex + 1}`
            );

            dot.addEventListener("click", () => {
                this.goTo(slideIndex + 1);
            });

            this.dotsContainer.appendChild(dot);

            return dot;
        });
    }

    goTo(targetIndex) {
        if (this.slideCount <= 1) {
            return;
        }

        this.index = targetIndex;
        this.isTransitioning = true;

        this.track.style.transition =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "none"
                : "";

        this.moveTrack();
        this.updateInterface();
    }

    moveTrack() {
        const offset = this.index * 100;

        this.track.style.transform = `translateX(-${offset}%)`;
    }

    jumpToCurrentSlide() {
        // Temporarily disable animation for clone repositioning.
        this.track.style.transition = "none";
        this.moveTrack();

        // Force layout so the browser applies the reset immediately.
        void this.track.offsetWidth;

        this.track.style.transition = "";
        this.isTransitioning = false;
    }

    updateInterface() {
        let realIndex = (this.index - 1 + this.slideCount)
            % this.slideCount;

        if (this.counter) {
            this.counter.textContent =
                `${realIndex + 1} / ${this.slideCount}`;
        }

        this.dots.forEach((dot, dotIndex) => {
            const active = dotIndex === realIndex;

            dot.classList.toggle("active", active);
            dot.setAttribute("aria-current", String(active));
        });
    }
}

// Initialize every slider on the page.
document.querySelectorAll("[data-slider]").forEach((slider) => {
    new ImageSlider(slider);
});