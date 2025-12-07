// admin-login.js
import { supabase } from "./supabaseClient.js";

const form = document.getElementById("adminLoginForm");
const statusEl = document.getElementById("loginStatus");

if (form && statusEl) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    statusEl.textContent = "";
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    if (!email || !password) {
      statusEl.textContent = "Please enter email and password.";
      statusEl.style.color = "red";
      return;
    }

    statusEl.textContent = "Signing in...";
    statusEl.style.color = "#111";

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error("Login error:", error);
      statusEl.textContent = "Invalid login credentials";
      statusEl.style.color = "red";
      return;
    }

    // Logged in
    window.location.href = "admin-dashboard.html";
  });
}
