const deleteProduct = (btn) => {
    console.log(btn);
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement = btn.closest('article');
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