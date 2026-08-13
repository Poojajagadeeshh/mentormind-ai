document.addEventListener("DOMContentLoaded", function () {

    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const authMessage = document.getElementById("authMessage");

    function showError(data) {
        authMessage.style.color = "red";

        if (Array.isArray(data.detail)) {
            authMessage.innerText = data.detail.map(err => err.msg).join(", ");
        } else {
            authMessage.innerText = data.detail || "Login failed";
        }
    }

    // LOGIN
    loginBtn.addEventListener("click", async function () {

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
    
        const formData = new URLSearchParams();
        formData.append("grant_type", "password");
        formData.append("username", email);
        formData.append("password", password);
    
        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            });
    
            const data = await response.json();
    
            if (response.ok) {
                authMessage.style.color = "green";
                authMessage.innerText = "Login successful! Redirecting...";
    
                localStorage.setItem("token", data.access_token);
    
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
    
            } else {
                authMessage.innerText = JSON.stringify(data.detail);
            }
    
        } catch (error) {
            authMessage.innerText = "Server connection failed";
        }
    
    });
    // REGISTER
    registerBtn.addEventListener("click", async function () {

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                authMessage.style.color = "green";
                authMessage.innerText = "Registered successfully! Now login.";
            } else {
                showError(data);
            }

        } catch (error) {
            authMessage.innerText = "Server connection failed";
        }

    });

});