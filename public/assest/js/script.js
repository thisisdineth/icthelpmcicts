// Add smooth scroll for the "Explore Features" button
document.querySelector('.cta-button').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('#features').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});
