window.addEventListener('DOMContentLoaded', async () => {
    const {pathname} = window.location;
    const isCategoryView = pathname.includes('/categoria/1') || pathname.includes('/categoria/2');
    if (!isCategoryView) return;
})