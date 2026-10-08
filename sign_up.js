/* ==========================================
   ROTATING QUOTE (left panel)
========================================== */

const signupQuotes = [
    { quote: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { quote: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
    { quote: "Imagination is more important than knowledge.", author: "Albert Einstein" },
    { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" }
];

let signupQuoteIndex = 0;

function rotateSignupQuote() {
    const quoteEl = document.getElementById("signupQuote");
    const authorEl = document.getElementById("signupAuthor");
    if (!quoteEl || !authorEl) return;

    signupQuoteIndex = (signupQuoteIndex + 1) % signupQuotes.length;
    quoteEl.textContent = `"${signupQuotes[signupQuoteIndex].quote}"`;
    authorEl.textContent = `— ${signupQuotes[signupQuoteIndex].author}`;
}

setInterval(rotateSignupQuote, 6000);

/* ==========================================
   SHOW / HIDE PASSWORD
========================================== */

function wireToggle(iconSelector, inputEl) {
    const icon = document.querySelector(iconSelector);
    if (!icon || !inputEl) return;

    icon.addEventListener("click", () => {
        const isPassword = inputEl.type === "password";
        inputEl.type = isPassword ? "text" : "password";

        const i = icon.querySelector("i");
        if (i) {
            i.classList.toggle("fa-eye", !isPassword);
            i.classList.toggle("fa-eye-slash", isPassword);
        }
    });
}

const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");

wireToggle(".togglePassword", passwordInput);
wireToggle(".toggleConfirm", confirmInput);

/* ==========================================
   PASSWORD STRENGTH METER
========================================== */

const strengthBar = document.querySelector(".strength-bar");
const strengthText = document.getElementById("strengthText");

function scorePassword(value) {
    let score = 0;
    if (value.length >= 6) score++;
    if (value.length >= 10) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
}

if (passwordInput) {
    passwordInput.addEventListener("input", () => {
        const value = passwordInput.value;
        const score = scorePassword(value);

        const levels = [
            { width: "0%", color: "red", label: "Password Strength" },
            { width: "20%", color: "#ef4444", label: "Very Weak" },
            { width: "40%", color: "#f97316", label: "Weak" },
            { width: "60%", color: "#eab308", label: "Fair" },
            { width: "80%", color: "#84cc16", label: "Good" },
            { width: "100%", color: "#22c55e", label: "Strong" }
        ];

        const level = levels[Math.min(score, levels.length - 1)];

        if (strengthBar) {
            strengthBar.style.width = value ? level.width : "0%";
            strengthBar.style.background = level.color;
        }
        if (strengthText) {
            strengthText.textContent = value ? level.label : "Password Strength";
        }
    });
}

/* ==========================================
   SIGN UP -> BACKEND
========================================== */

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        const termsChecked = document.getElementById("terms").checked;

        if (!fullname || !username || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!termsChecked) {
            alert("Please agree to the Terms & Conditions to continue.");
            return;
        }

        const submitBtn = signupForm.querySelector(".signup-btn");
        const originalText = submitBtn ? submitBtn.innerHTML : "";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = "Creating Account...";
        }

        try {

            const response = await fetch("backend/signup.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({
                    fullname,
                    username,
                    email,
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                alert("Account created successfully!");
                window.location.href = "homepage.html";
            } else {
                alert(data.message || "Could not create your account.");
            }

        } catch (err) {

            console.error("Signup error:", err);
            alert("Could not reach the server. Make sure Apache & MySQL are running in XAMPP.");

        } finally {

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }

        }

    });

}

/* ==========================================
   PAGE LOAD ANIMATION
========================================== */

window.addEventListener("load", () => {

    const container = document.querySelector(".container");
    if (!container) return;

    container.style.opacity = "0";
    container.style.transform = "translateY(40px)";

    setTimeout(() => {
        container.style.transition = ".8s";
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";
    }, 100);

});
