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

    const userId = btn.parentNode.querySelector('[name=userId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement = btn.closest('tr');
    fetch('/admin/users/' + userId, {
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
    //console.log(csrf);

}
const addReview = (btn) => {
    console.log(btn);
    const prodId = btn.parentNode.querySelector('[name=prodId]').value;
    const userId = btn.parentNode.querySelector('[name=userId]').value;
    const message = btn.parentNode.querySelector('[name=messageReview]').value;
    const newScore = +btn.parentNode.querySelector('[name=scoreProduct]').value;
    const previousScore = +btn.parentNode.querySelector('[name=score]').value;
    const numOfReviews = +btn.parentNode.querySelector('[name=numOfReviews]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const totalScore = Math.ceil((newScore + previousScore) / (numOfReviews + 1));
    //const productElement = btn.closest('tr');
    //console.log(prodId, message, score, numOfReviews);
    fetch('/products/' + prodId, {
            method: 'PATCH',
            body: JSON.stringify({
                totalScore: newScore + previousScore,
                message: message,
                userId: userId,
            }),
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrf
            }
        })
        .then((result) => {
            console.log('result', result);
            //console.log(result.json());
            location.reload("#refreshDiv");
            return result.json();
        })
        .then(data => {
            //productElement.parentNode.removeChild(productElement);
            console.log(data);
        })
        .catch(err => console.log(err));
    //console.log(prodId);
    //console.log(csrf);
}