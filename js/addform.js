import{ signInFirebase, signUpFirebase, postAdToDb,uploadImage,getRealTimeAds} from '../config/firebase.js'

getAds()
window.signUp = async function(){
    event.preventDefault();
    console.log("working");
    
    // Value get
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const fullName = document.getElementById("name").value;
    const age = document.getElementById("age").value;

    // Log form values for debugging
    console.log({email, password, fullName, age});

    // Firebase sign up function call
    try {
        await signUpFirebase({email, password, fullName, age});
        alert('Registered successfully');
        window.location.href = '../index.html';
    } catch(e) {
        console.error("Error during sign-up:", e);
        alert("Registration failed: " + e.message); // Optional: Provide feedback to the user
    }
}


window.signIn = async function(){
    event.preventDefault();
    console.log("working");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

 
    //firebase sign in function call

    try{
        await signInFirebase(email,password)
        window.location.href = '../index.html'
    }catch(e){
        console.error("Error during sign-up:", e);
        alert("Registration failed: " + e.message); // Optional: Provide feedback to the user
    }
}

window.postAd = async function(){
    event.preventDefault();

    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const image = document.getElementById('image').files[0];

    console.log(title,price,description,image)

    if (!title || !price || !description || !image) {
        alert("Please fill in all fields and select an image.");
        return;
    }

    try {
        const imageUrl = await uploadImage(image)
        await postAdToDb(title, price, description,imageUrl);
        alert('Ad posted successfully');
        window.location.href = '../index.html';
    } catch(e) {
        console.error("Error during ad posting:", e);
        alert("Ad posting failed: " + e.message);
    }
}

function getAds(){
    //1
    getRealTimeAds((ads)=>{

        //4
        const adsElem = document.getElementById('ads')
        adsElem.innerHTML = ''
        for(let item of ads){
            adsElem.innerHTML += `<div onclick="goToDetail('${item.id}')" class="card"">
            <img src=${item.imageUrl} class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <p class="card-text">Rs ${item.price} </p>
              <a href="#" class="btn btn-primary">Detail</a>
            </div>
            </div>`
        }
    }) 
}


window.goToDetail = async function(id){
    location.href = `view/detail.html?id=${id}`
}