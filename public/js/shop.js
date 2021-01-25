 let index = 0;
 var products;
 const produtcsApi = () => {
     fetch('/product/api', {
             method: 'GET',
             headers: {
                 'Content-Type': 'application/json',
             }
         })
         .then((result) => {
             //console.log('result', result);
             return result.json();
         })
         .then(data => {
             //console.log(data);
             products = data;
             return data;
         })
         .catch(err => console.log(err));
 }

 produtcsApi();
 const plusImage = (btn) => {
     let img = document.getElementById("imageProd");
     let link = document.getElementById("imageLink");
     let title = document.getElementById("titleUp");
     console.log('plus');
     index += 1;
     if (index > 3) {
         index = 0;
     }
     let product = products.products[index];
     title.innerHTML = product.title;
     img.src = product.imageUrl.slice(6);
     img.alt = product._id;
     link.href = '/products/' + product._id;
     //console.log(index);
     //console.log(products.products[index]);
 }
 const minusImage = (btn) => {
     let img = document.getElementById("imageProd");
     let link = document.getElementById("imageLink");
     let title = document.getElementById("titleUp");
     console.log('minus');
     index -= 1;
     if (index < 0) {
         index = 3;
     }
     let product = products.products[index];
     title.innerHTML = product.title;

     img.src = product.imageUrl.slice(6);
     img.alt = product._id;
     link.href = '/products/' + product._id;
     //console.log(index);
     //console.log(products.products[index]);
     //btn.setAttribute("src", prevSquare.getAttribute("srcOff"));
 }