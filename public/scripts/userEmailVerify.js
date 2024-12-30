import { userLogged } from './checkForUserLogged.js';
import { checkForNumericInputs, disableBtn } from './utils.js'
window.addEventListener('load', () => {
    checkForNumericInputs();
    // Logica para ir cambiando de input a medida que se escribe
    const inputs = Array.from(document.querySelectorAll('.verify-code-input'));
    const verifyButton = document.querySelector('.verify-button')
    // Itero por cada uno
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        let lastInputValue = '';
        // Evento si cambia el input
        input.addEventListener('input', (e) => {
            verifyButton.classList.add('disabled');
            if (input.value.length <= 1) {
                lastInputValue = input.value;
                // Si no es el ultimo paso le focus
                if (input.value.length === 1) {
                    input.blur();
                    if (i < inputs.length - 1) {
                        inputs[i + 1].focus();
                    }
                }

            } else {
                //Si ya tenia, le dejo el mismo valor de antes
                input.value = lastInputValue
            };
            checkForAllInputsFilled();

        });
        if (i == 0) {
            // Evento si hacen un paste en el input
            input.addEventListener('paste', (e) => {
                input.blur();
                const valueToPaste = e.clipboardData || window.clipboardData;
                // Agarro el codigo en un array
                const codeToPasteArray = valueToPaste.getData("text").split('').filter(num => !isNaN(parseInt(num)));
                console.log(codeToPasteArray);
                codeToPasteArray.forEach((digit, j) => {
                    if (j <= 5) {
                        inputs[j].value = digit;
                    }
                });
                checkForAllInputsFilled();
            });
        }

    }
    // Capturo cuando le da a "Reenviar codigo"
    const resendCode = document.querySelector('.resend-code');
    resendCode.addEventListener('click', async (e) => {
        try {
            // Pinto el boton de disabled
            resendCode.classList.add('loading');
            // Hago el fetch
            let response = await fetch(`${window.location.origin}/api/user/send-verification-code?user_id=${userLogged.id}`);
            response = await response.json();
            let msg;
            // si no da ok
            if (!response.ok) {
                msg = isInSpanish ? "Ha ocurrido un error al mandar el codigo, intente nuevamente" : "An error occurred while sending the code, please try again"
                // Armo tarjeta de error
                showCardMessage(false, msg)
                return
            };
            // Aca dio bien ==> Pinto el mensaje avisando que se envio
            // Armo tarjeta de success
            msg = response.msg
            showCardMessage(true, msg);
            // Si dio ok, lo dejo disabled 1 minuto
            disableBtn(resendCode,60000)
            return
        } catch (error) {
            return console.log(`Falle en verifyButton.addEventListener: ${error}`)
        }
    });
    // Capturo cuando le da a "Verificar codigo"
    verifyButton.addEventListener('click', async (e) => {
        try {
            let code = '';
            inputs.forEach(inp => {
                if (inp.value.length == 0) e.preventDefault();
                code += inp.value;
            });
            verifyButton.classList.add('loading')
            let response = await fetch(`${window.location.origin}/api/user/check-verification-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code, user_id: userLogged.id }),
            });
            // Antes de hacer el fetch le hago el disabled
            response = await response.json();
            verifyButton.classList.remove('loading');
            let msg = isInSpanish ? response?.msg?.es : response?.msg?.en;
            if (!response.ok) {
                // Armo tarjeta de error
                showCardMessage(false, msg)
                return
            };
            // Aca dio bien ==> Pinto el mensaje de ok
            // Armo tarjeta de error
            showCardMessage(true, msg);
            setTimeout(() => {
                window.location.href = `/`
            }, 1000);
            return
        } catch (error) {
            return console.log(`Falle en verifyButton.addEventListener: ${error}`)
        }
    });
    function checkForAllInputsFilled() {
        // Me fijo si todos estan con value, si es asi hablito el boton
        const inputsNotFilled = inputs.find(inp => inp.value.length == 0);
        // Si no hay ninguno, le saco el disabled
        if (!inputsNotFilled) verifyButton.classList.remove('disabled');
    }
});