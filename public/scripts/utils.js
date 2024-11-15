export function checkCheckoutButtons(){
    const checkoutCards = document.querySelectorAll('.checkout_card');
    checkoutCards.forEach(card => {
        if(card.dataset.listened)return
        card.dataset.listened = true;
        const addBtn = card.querySelector('.add_more_product');
        const minusBtn = card.querySelector('.remove_more_product');
        const removeBtn = card.querySelector('.remove_card_btn');
        const cardPrice = card.querySelector('.card_price');
        const productPrice = card.dataset.price;
        addBtn.addEventListener('click',()=>{
            let actualQuantitySpan = card.querySelector('.card_product_amount');
            actualQuantitySpan.innerHTML = parseInt(actualQuantitySpan.innerHTML) + 1;
            if(actualQuantitySpan.innerHTML >1){ //Si es mas de 1 cambio clases
                minusBtn.classList.remove('hidden');
                removeBtn.classList.add('hidden');
            };
            cardPrice.innerHTML = `$${parseInt(actualQuantitySpan.innerHTML) * productPrice}`
        });
        minusBtn.addEventListener('click',()=>{  
            let actualQuantitySpan = card.querySelector('.card_product_amount');
            actualQuantitySpan.innerHTML = parseInt(actualQuantitySpan.innerHTML) - 1;
            if (actualQuantitySpan.innerHTML == 1) {//Si es 1 cambio clases
                minusBtn.classList.add('hidden');
                removeBtn.classList.remove('hidden');
            };
            cardPrice.innerHTML = `$${parseInt(actualQuantitySpan.innerHTML) * productPrice}`   
        });
        removeBtn.addEventListener('click',()=>{
            card.remove();
        });
    });
}