document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-section') === 'mining') {
            item.addEventListener('click', () => {
                showNotification('Раздел находится в разработке', 'info');
            });
        }
    });
}); 