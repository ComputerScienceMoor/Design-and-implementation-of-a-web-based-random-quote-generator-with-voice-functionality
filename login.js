/* ==========================================
   SHOW / HIDE PASSWORD
========================================== */

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    const icon = togglePassword.querySelector("i");

    if (password.type === "password") {

        password.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    } else {

        password.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }

});


/* ==========================================
   ROTATING MOTIVATIONAL QUOTES
========================================== */

const quotes = [

{
quote:"Success is not final, failure is not fatal: it is the courage to continue that counts.",
author:"Winston Churchill"
},

{
quote:"Education is the most powerful weapon which you can use to change the world.",
author:"Nelson Mandela"
},

{
quote:"The future depends on what you do today.",
author:"Mahatma Gandhi"
},

{
quote:"Believe you can and you're halfway there.",
author:"Theodore Roosevelt"
},

{
quote:"Stay hungry. Stay foolish.",
author:"Steve Jobs"
}

];

let currentQuote = 0;

function changeQuote(){

currentQuote++;

if(currentQuote >= quotes.length){

currentQuote = 0;

}

document.getElementById("loginQuote").textContent =
`"${quotes[currentQuote].quote}"`;

document.getElementById("quoteAuthor").textContent =
`— ${quotes[currentQuote].author}`;

}

setInterval(changeQuote,6000);


/* ==========================================
   LOGIN -> BACKEND
========================================== */

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.querySelector("input[type='email']").value.trim();

    const passwordValue =
        document.getElementById("password").value.trim();

    if (email === "" || passwordValue === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (!email.includes("@")) {
        alert("Enter a valid email address.");
        return;
    }

    const submitBtn = document.querySelector(".login-btn");
    const originalText = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Logging In...";
    }

    try {

        const response = await fetch("backend/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ email, password: passwordValue })
        });

        const data = await response.json();

        if (data.success) {

            alert("Login Successful!");
            window.location.href = "homepage.html";

        } else {

            alert(data.message || "Invalid email or password.");

        }

    } catch (err) {

        console.error("Login error:", err);
        alert("Could not reach the server. Make sure Apache & MySQL are running in XAMPP.");

    } finally {

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }

    }

});


/* ==========================================
   REMEMBER ME
========================================== */

const remember =
document.querySelector("input[type='checkbox']");

const emailInput =
document.querySelector("input[type='email']");

window.onload=()=>{

const savedEmail=

localStorage.getItem("rememberEmail");

if(savedEmail){

emailInput.value=savedEmail;

remember.checked=true;

}

};

remember.addEventListener("change",()=>{

if(remember.checked){

localStorage.setItem(

"rememberEmail",

emailInput.value

);

}else{

localStorage.removeItem("rememberEmail");

}

});


/* ==========================================
   INPUT ANIMATION
========================================== */

document.querySelectorAll("input").forEach(input=>{

input.addEventListener("focus",()=>{

input.parentElement.style.transform="scale(1.03)";

});

input.addEventListener("blur",()=>{

input.parentElement.style.transform="scale(1)";

});

});


/* ==========================================
   LOGIN BUTTON RIPPLE
========================================== */

const loginBtn = document.querySelector(".login-btn");

loginBtn.addEventListener("click",(e)=>{

const ripple=document.createElement("span");

ripple.classList.add("ripple");

loginBtn.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},600);

});


/* ==========================================
   PAGE LOAD ANIMATION
========================================== */

window.addEventListener("load",()=>{

document.querySelector(".container").style.opacity="0";

document.querySelector(".container").style.transform="translateY(40px)";

setTimeout(()=>{

document.querySelector(".container").style.transition=".8s";

document.querySelector(".container").style.opacity="1";

document.querySelector(".container").style.transform="translateY(0)";

},100);

});
