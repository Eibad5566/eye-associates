// script.js
import { supabase } from "./supabaseClient.js";

/* ===================== NAVBAR & BASIC HELPERS ===================== */

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}
window.scrollToSection = scrollToSection;

// WhatsApp shortcut
function openWhatsApp() {
  const phone = "+923112032370";
  const text = encodeURIComponent(
    "Hello, I would like to ask about your import/export services."
  );
  window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
}
window.openWhatsApp = openWhatsApp;

// Year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ===================== HERO COUNTER ANIMATION ===================== */

function animateStats() {
  const stats = document.querySelectorAll(".stat-number");
  stats.forEach((el) => {
    const target = Number(el.getAttribute("data-target") || "0");
    const suffix = el.getAttribute("data-suffix") || "";
    let current = 0;
    const steps = 60;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.round(current) + suffix;
    }, 25);
  });
}

const heroText = document.querySelector(".hero-text");
if (heroText) {
  const heroObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStats();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );
  heroObserver.observe(heroText);
}

/* ===================== SCROLL FADE-IN ===================== */

const fadeEls = document.querySelectorAll(".fade-in");
if (fadeEls.length) {
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  fadeEls.forEach((el) => fadeObserver.observe(el));
}

/* ===================== SHIPMENT TRACKING (shipments table) ===================== */

const trackingForm = document.getElementById("trackingForm");
const trackingInput = document.getElementById("trackingId");
const trackingResult = document.getElementById("trackingResult");

if (trackingForm && trackingInput && trackingResult) {
  trackingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const trackingId = trackingInput.value.trim();
    if (!trackingId) {
      trackingResult.textContent = "Please enter a Tracking ID.";
      trackingResult.style.color = "red";
      return;
    }

    trackingResult.textContent = "Searching...";
    trackingResult.style.color = "#111";

    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_id", trackingId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Tracking error:", error);
      trackingResult.textContent = "Error while checking shipment.";
      trackingResult.style.color = "red";
      return;
    }

    if (!data) {
      trackingResult.textContent = "No shipment found with this Tracking ID.";
      trackingResult.style.color = "red";
      return;
    }

    const updatedText = data.updated_at
      ? new Date(data.updated_at).toLocaleString()
      : "N/A";

    trackingResult.innerHTML = `
      <p><strong>Status:</strong> <span class="status-pill">${data.status ?? "Unknown"}</span></p>
      <p><strong>Origin:</strong> ${data.origin ?? ""}</p>
      <p><strong>Destination:</strong> ${data.destination ?? ""}</p>
      <p><strong>Last Update:</strong> ${updatedText}</p>
      <p><strong>Description:</strong> ${data.description ?? ""}</p>
    `;
    trackingResult.style.color = "#065f46";
  });
}

/* ===================== CONTACT FORM (contact_messages table) ===================== */

const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

if (contactForm && contactStatus) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const phone = document.getElementById("phoneInput").value.trim();
    const service = document.getElementById("serviceInput").value.trim();
    const message = document.getElementById("messageInput").value.trim();

    if (!name || !email || !phone || !service || !message) {
      contactStatus.textContent = "Please fill in all required fields.";
      contactStatus.style.color = "red";
      return;
    }

    contactStatus.textContent = "Sending...";
    contactStatus.style.color = "#111";

    const { error } = await supabase.from("contact_messages").insert([
      {
        name,
        email,
        phone,
        service,
        message,
      },
    ]);

    if (error) {
      console.error("Contact form error:", error);
      contactStatus.textContent = "Server error. Try again later.";
      contactStatus.style.color = "red";
      return;
    }

    contactForm.reset();
    contactStatus.textContent =
      "Thank you! Your message has been received. Our team will contact you soon.";
    contactStatus.style.color = "green";
  });
}

