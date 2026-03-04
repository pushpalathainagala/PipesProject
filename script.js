/**
 * MANGALAM HDPE PIPES - MAIN SCRIPT
 * 
 * BEST PRACTICE: Wrap all executable client-side code in a DOMContentLoaded event listener.
 * This guarantees that the HTML structure is fully parsed and available in the DOM 
 * before any script attempts to select or manipulate elements.
 */
document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Sticky Header Logic --- */
    // BEST PRACTICE: Cache DOM elements in variables to avoid querying the DOM repeatedly 
    // inside high-frequency events like scroll, which improves performance.
    const stickyHeader = document.getElementById('sticky-header');
    let lastScrollTop = 0;

    // Threshold in pixels before the sticky header is eligible to appear
    const scrollThreshold = 400;

    // Only apply scroll event if header exists
    if (stickyHeader) {
        /**
         * BEST PRACTICE for Scroll Events: Removing complex direction checking 
         * prevents jitter and bounce-scrolling bugs on Android Chrome.
         * We simply enforce absolute threshold crossing.
         */
        window.addEventListener('scroll', () => {
            // Get current scroll position cross-browser compatible
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > scrollThreshold) {
                // We are past the first fold threshold, lock the sticky header
                stickyHeader.classList.add('is-visible');
                stickyHeader.classList.remove('is-hidden');
            } else {
                // Scrolling back up above the fold - hide it completely
                stickyHeader.classList.remove('is-visible');
                stickyHeader.classList.add('is-hidden');
            }
            // Add a safety check to reset transform when at absolute top for iOS overscroll
            if (scrollTop <= 0) {
                stickyHeader.classList.remove('is-hidden', 'is-visible');
            }
        });
    }

    /* 
        ======================================================================
        2. Image Carousel with Hover Zoom
        ======================================================================
        This implementation doesn't use heavy libraries; it simply swaps the 
        `src` attribute of an `<img>` tag for the carousel, and manipulates 
        CSS `background-position` for the zoom.
    */
    const mainImg = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const zoomContainer = document.getElementById('zoom-container');
    const zoomLens = document.getElementById('zoom-lens');
    const zoomResult = document.getElementById('zoom-result');

    let currentImageIndex = 0;

    /**
     * Data Extraction: Build an array of high-resolution images dynamically 
     * based on the thumbnails available in the DOM to keep the script decoupled 
     * from hardcoded URLs.
     */
    let images = [];
    if (thumbnails.length > 0) {
        images = Array.from(thumbnails).map(thumb => {
            // Because we are using high-quality local assets, we simply inherit the source
            // The thumbnails are scaled downwards purely utilizing CSS
            return thumb.querySelector('img').src;
        });
    }

    // Function to update main image and active thumbnail
    function updateCarousel(index) {
        if (!mainImg || images.length === 0) return;

        if (index < 0) index = thumbnails.length - 1;
        if (index >= thumbnails.length) index = 0;

        currentImageIndex = index;

        // Add fade effect
        mainImg.style.opacity = '0';

        setTimeout(() => {
            mainImg.src = images[currentImageIndex];
            mainImg.style.opacity = '1';

            // Wait for image to load to set zoom background correctly
            mainImg.onload = function () {
                if (zoomResult) {
                    zoomResult.style.backgroundImage = `url('${images[currentImageIndex]}')`;
                }
            };
        }, 200);

        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnails[currentImageIndex].classList.add('active');
    }

    // Thumbnail Clicks
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            updateCarousel(index);
        });
    });

    // Arrow Clicks
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => updateCarousel(currentImageIndex - 1));
        nextBtn.addEventListener('click', () => updateCarousel(currentImageIndex + 1));
    }


    /* --- Hover Zoom Feature --- */
    if (zoomContainer && zoomLens && zoomResult && mainImg) {
        zoomContainer.addEventListener('mouseenter', function () {
            // Only enable on larger screens
            if (window.innerWidth > 1024) {
                zoomLens.style.display = 'block';
                zoomResult.style.display = 'block';
                // Ensure high-res background is set
                zoomResult.style.backgroundImage = `url('${mainImg.src}')`;
            }
        });

        zoomContainer.addEventListener('mouseleave', function () {
            zoomLens.style.display = 'none';
            zoomResult.style.display = 'none';
        });

        zoomContainer.addEventListener('mousemove', moveLens);
    }

    function moveLens(e) {
        if (window.innerWidth <= 1024 || !mainImg || !zoomLens || !zoomResult) return;

        const pos = getCursorPos(e);

        // Define lens size
        const lensSize = 120;
        zoomLens.style.width = lensSize + 'px';
        zoomLens.style.height = lensSize + 'px';

        let x = pos.x - (lensSize / 2);
        let y = pos.y - (lensSize / 2);

        // Prevent lens from moving outside the image boundaries
        if (x > mainImg.offsetWidth - lensSize) x = mainImg.offsetWidth - lensSize;
        if (x < 0) x = 0;
        if (y > mainImg.offsetHeight - lensSize) y = mainImg.offsetHeight - lensSize;
        if (y < 0) y = 0;

        zoomLens.style.left = x + "px";
        zoomLens.style.top = y + "px";

        // Calculate background sizing and position
        // Assuming the original image is large enough. We simulate zoom by adjusting background Size.
        const focusZoomLevel = 2; // Zoom scalar

        zoomResult.style.backgroundSize = `${mainImg.offsetWidth * focusZoomLevel}px ${mainImg.offsetHeight * focusZoomLevel}px`;

        // Calculate the ratio of the (zoomed background) vs (displayed image)
        const ratioX = (mainImg.offsetWidth * focusZoomLevel) / mainImg.offsetWidth;
        const ratioY = (mainImg.offsetHeight * focusZoomLevel) / mainImg.offsetHeight;

        zoomResult.style.backgroundPosition = `-${x * ratioX}px -${y * ratioY}px`;
    }

    function getCursorPos(e) {
        let x = 0, y = 0;
        const rect = mainImg.getBoundingClientRect();
        // Calculate cursor position relative to the image
        x = e.pageX - rect.left - window.pageXOffset;
        y = e.pageY - rect.top - window.pageYOffset;
        return { x, y };
    }


    /* 
        ======================================================================
        3. Modal Event Management
        ======================================================================
        BEST PRACTICE: Manage active states with CSS classes (.active) rather than 
        manipulating inline `style.display`. It scales better and allows for CSS animations.
    */
    const modal = document.getElementById('callback-modal');
    // We select multiple nodes that serve the same purpose array.
    const contactBtns = [
        document.getElementById('nav-contact-btn'),
        document.getElementById('sticky-contact-btn'),
        document.getElementById('hero-quote-btn')
    ];
    const closeModalBtn = document.getElementById('close-modal');

    contactBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent jump-to-anchor behavior
                if (modal) modal.classList.add('active');
            });
        }
    });

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // BEST PRACTICE: Close modals on overlay backdrop click (accessibility/UX).
    if (modal) {
        modal.addEventListener('click', (e) => {
            // Check if the actual matched element is the overlay itself, not its children
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }


    /* 
        ======================================================================
        4. Mobile Menu Toggle
        ======================================================================
    */
    // BEST PRACTICE: Use event delegation or loop through all instances when a component 
    // (like a navbar) appears multiple times on the same page (Base Nav + Sticky Nav)
    const mobileMenuBtns = document.querySelectorAll('.mobile-toggle');

    mobileMenuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find the closest parent navigation container element
            const navContainer = btn.closest('nav');
            if (!navContainer) return;

            // Find the specific links container inside THIS navigation bar
            const navLinks = navContainer.querySelector('.nav-links');

            if (navLinks) {
                // Toggle display using inline styles (for simplicity in this vanilla JS demo without extra CSS classes)
                navLinks.style.display = (navLinks.style.display === 'flex') ? 'none' : 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#FFFFFF';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                navLinks.style.zIndex = '100';
            }
        });
    });

    /* 
        ======================================================================
        5. Tech Specs Tabs Interactivity
        ======================================================================
    */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tableContainers = document.querySelectorAll('.table-container');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Remove active state from ALL tabs and hide ALL tab bodies (data tables)
            tabBtns.forEach(b => b.classList.remove('active'));
            tableContainers.forEach(t => {
                t.style.display = 'none';
                t.classList.remove('active');
            });

            // 2. Add active states to the clicked button
            btn.classList.add('active');

            // 3. Find and show the corresponding tab target content
            const targetId = btn.getAttribute('data-target');
            const targetContainer = document.getElementById(targetId);
            if (targetContainer) {
                targetContainer.style.display = 'block';
                targetContainer.classList.add('active');
            }
        });
    });

});
