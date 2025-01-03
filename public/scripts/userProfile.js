window.addEventListener('load', async () => {
    const {pathname} = window.location;
    if(pathname.includes('perfil')){
        console.log('perfil')
    } else if (pathname.includes('admin')){
        console.log('admin')
    }
})