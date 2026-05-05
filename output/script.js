document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.main-header');

    const handleScroll = () => {
        if (window.scrollY > 50) { // Adjust scroll threshold as needed
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);

    // Initial check in case the page is loaded with a scroll position
    handleScroll();
});
