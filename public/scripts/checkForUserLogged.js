export let userLogged = null;
export let userId = null;

export const checkForUserLogged = async () => {
    try {
        await fetch('/api/user/check-for-user-logged')
                    .then(response => response.json())
                    .then(data => {
                        if(data){
                            userLogged = data;
                        }
                    })
    } catch (error) {
        console.log(`error fetching user checking: ${error}`);
        userLogged = null;
    }
}

checkForUserLogged();

