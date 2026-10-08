/* ==========================================
   TYPING EFFECT
========================================== */

const typingWords = [
    "Inspire Your Mind",
    "Discover Great Thinkers",
    "Generate Daily Motivation",
    "Listen To Powerful Quotes",
    "Share Inspiration"
];

const heroTitle = document.querySelector(".hero-left h1");

let wordIndex = 0;

function changeHeroWord() {

    if (!heroTitle) return;

    heroTitle.innerHTML = `Words Have <span>${typingWords[wordIndex]}</span>`;

    wordIndex++;

    if (wordIndex >= typingWords.length) {
        wordIndex = 0;
    }

}

setInterval(changeHeroWord, 3000);


/* ==========================================
   COUNTER
========================================== */

function animateCounter(id, target) {

    const counter = document.getElementById(id);

    if (!counter) return;

    let current = 0;

    const increment = target / 150;

    const timer = setInterval(() => {

        current += increment;

        counter.innerText = Math.floor(current).toLocaleString() + "+";

        if (current >= target) {

            counter.innerText = target.toLocaleString() + "+";

            clearInterval(timer);

        }

    }, 15);

}

window.addEventListener("load", () => {

    animateCounter("quoteCount", 50000);

});


/* ==========================================
   HERO CTA BUTTONS
========================================== */

const getStartedBtn = document.getElementById("getStartedBtn");
if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
        window.location.href = "sign_up.html";
    });
}

const exploreQuotesBtn = document.getElementById("exploreQuotesBtn");
if (exploreQuotesBtn) {
    exploreQuotesBtn.addEventListener("click", () => {
        const target = document.querySelector("#features");
        if (target) target.scrollIntoView({ behavior: "smooth" });
    });
}

/* ==========================================
   SMOOTH SCROLL
========================================== */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();

        const target = document.querySelector(link.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


/* ==========================================
   NAVBAR EFFECT
========================================== */

window.addEventListener("scroll", () => {

    const nav = document.querySelector("header");

    if (!nav) return;

    if (window.scrollY > 40) {

        nav.style.background = "rgba(10,15,35,.75)";
        nav.style.backdropFilter = "blur(20px)";

    } else {

        nav.style.background = "rgba(255,255,255,.05)";

    }

});


/* ==========================================
   QUOTE ROTATION
========================================== */

const quotes = [

{
text:"Success is not final, failure is not fatal; it is the courage to continue that counts.",
author:"Winston Churchill"
},

{
text:"The best way to predict the future is to invent it.",
author:"Alan Kay"
},

{
text:"Stay hungry. Stay foolish.",
author:"Steve Jobs"
},

{
text:"Education is the most powerful weapon which you can use to change the world.",
author:"Nelson Mandela"
},

{
text:"Imagination is more important than knowledge.",
author:"Albert Einstein"
}

];

let quoteIndex = 0;

function rotateQuote() {

    const quote = document.getElementById("dailyQuote");
    const author = document.getElementById("quoteAuthor");

    if (!quote || !author) return;

    quoteIndex++;

    if (quoteIndex >= quotes.length) {

        quoteIndex = 0;

    }

    quote.textContent = quotes[quoteIndex].text;
    author.textContent = "— " + quotes[quoteIndex].author;

}

setInterval(rotateQuote, 7000);


/* ==========================================
   SPEECH SYNTHESIS
========================================== */

const listenBtn = document.getElementById("listenBtn");

if (listenBtn) {

listenBtn.addEventListener("click", () => {

const text =
document.getElementById("dailyQuote").textContent;

const speech = new SpeechSynthesisUtterance(text);

speech.rate = 0.9;
speech.pitch = 1;
speech.volume = 1;

speechSynthesis.cancel();
speechSynthesis.speak(speech);

});

}


/* ==========================================
   SAVE FAVORITE
========================================== */

const saveBtn = document.getElementById("saveBtn");

if (saveBtn) {

saveBtn.addEventListener("click", () => {

const quote =
document.getElementById("dailyQuote").textContent;

const author =
document.getElementById("quoteAuthor").textContent;

let favourites =
JSON.parse(localStorage.getItem("quotes")) || [];

favourites.push({

quote,
author

});

localStorage.setItem("quotes",

JSON.stringify(favourites)

);

alert("Quote saved successfully!");

});

}


/* ==========================================
   SHARE
========================================== */

const shareBtn = document.getElementById("shareBtn");

if (shareBtn) {

shareBtn.addEventListener("click", async () => {

const quote =
document.getElementById("dailyQuote").textContent;

const author =
document.getElementById("quoteAuthor").textContent;

const text = quote + "\n\n" + author;

if (navigator.share) {

await navigator.share({

title:"QuoteGen",

text:text

});

}

else{

navigator.clipboard.writeText(text);

alert("Quote copied to clipboard.");

}

});

}


/* ==========================================
   HERO CARD HOVER
========================================== */

document.querySelectorAll(".person-card").forEach(card => {

card.addEventListener("mousemove", e => {

const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;

const y = e.clientY - rect.top;

card.style.transform =

`perspective(1000px)
rotateY(${(x-150)/25}deg)
rotateX(${-(y-80)/25}deg)
translateY(-8px)`;

});

card.addEventListener("mouseleave", () => {

card.style.transform =
"perspective(1000px) rotateX(0) rotateY(0)";

});

});


/* ==========================================
   TESTIMONIAL ROTATION
========================================== */

const testimonials = [

{
text:"QuoteGen motivates me every morning. I especially enjoy the voice playback feature.",
name:"Computer Science Student"
},

{
text:"The interface is clean, responsive and very easy to use.",
name:"Project Supervisor"
},

{
text:"One of the best motivational quote applications I've used.",
name:"Beta Tester"
}

];

let testimonialIndex = 0;

setInterval(() => {

const card =
document.querySelector(".testimonial-card p");

const name =
document.querySelector(".user h4");

if (!card || !name) return;

testimonialIndex++;

if(testimonialIndex >= testimonials.length){

testimonialIndex = 0;

}

card.textContent =
testimonials[testimonialIndex].text;

name.textContent =
testimonials[testimonialIndex].name;

}, 6000);