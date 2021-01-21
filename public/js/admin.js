const deleteProduct = (btn) => {
    console.log(btn);
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement = btn.closest('tr');
    fetch('/admin/product/' + prodId, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf
            }
        })
        .then((result) => {
            console.log('result', result);
            //console.log(result.json());
            return result.json();
        })
        .then(data => {
            //modern browser
            //productElement.remove();

            productElement.parentNode.removeChild(productElement);
            console.log(data);
        })
        .catch(err => console.log(err));
    //console.log(prodId);
    //console.log(csrf);
}
const deleteUser = (btn) => {
    console.log("delete User button ", btn);
    /*
        const prodId = btn.parentNode.querySelector('[name=productId]').value;
        const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
        const productElement = btn.closest('tr');
        fetch('/admin/product/' + prodId, {
                method: 'DELETE',
                headers: {
                    'csrf-token': csrf
                }
            })
            .then((result) => {
                console.log('result', result);
                //console.log(result.json());
                return result.json();
            })
            .then(data => {
                 //modern browser
                //productElement.remove();
                
                productElement.parentNode.removeChild(productElement);
                console.log(data);
            })
            .catch(err => console.log(err));
        //console.log(prodId);
        //console.log(csrf);
        */
}
const addReview = (btn) => {
    console.log(btn);
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const message = btn.parentNode.querySelector('[name=messageReview]').value;
    const score = btn.parentNode.querySelector('[name=score]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement = btn.closest('tr');
    fetch('/admin/product/' + prodId, {
            method: 'POST',
            headers: {
                'csrf-token': csrf
            }
        })
        .then((result) => {
            console.log('result', result);
            //console.log(result.json());
            return result.json();
        })
        .then(data => {
            /* //modern browser
            //productElement.remove();
            */
            productElement.parentNode.removeChild(productElement);
            console.log(data);
        })
        .catch(err => console.log(err));
    //console.log(prodId);
    //console.log(csrf);
}