document.addEventListener("DOMContentLoaded", function () {

    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const authMessage = document.getElementById("authMessage");

    // LOGIN
    loginBtn.addEventListener("click", async function () {

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful!");
                localStorage.setItem("token", data.access_token);
            } else {
                authMessage.innerText = data.detail || "Login failed";
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
                authMessage.style.color = "red";
                authMessage.innerText = data.detail || "Registration failed";
            }

        } catch (error) {
            authMessage.innerText = "Server connection failed";
        }

    });

});