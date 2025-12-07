// admin-dashboard.js
import { supabase } from "./supabaseClient.js";

const shipmentsTableBody = document.getElementById("shipmentsTable");
const contactTableBody = document.getElementById("contactMessagesTable");
const addShipmentBtn = document.getElementById("addShipmentBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminEmailDisplay = document.getElementById("adminEmailDisplay");

// Modal elements
const shipmentModal = document.getElementById("shipmentModal");
const shipmentModalTitle = document.getElementById("shipmentModalTitle");
const closeShipmentModalBtn = document.getElementById("closeShipmentModal");
const cancelShipmentBtn = document.getElementById("cancelShipmentBtn");
const saveShipmentBtn = document.getElementById("saveShipmentBtn");

const trackingInput = document.getElementById("trackingInput");
const originInput = document.getElementById("originInput");
const destinationInput = document.getElementById("destinationInput");
const statusInput = document.getElementById("statusInput");
const descriptionInput = document.getElementById("descriptionInput");

let editingShipmentId = null; // null = create mode

/* ===================== AUTH GUARD ===================== */

async function requireAuth() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    window.location.href = "admin-login.html";
    return null;
  }
  return data.user;
}

/* ===================== LOAD DATA ===================== */

async function loadShipments() {
  shipmentsTableBody.innerHTML =
    '<tr><td colspan="6">Loading shipments...</td></tr>';

  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Load shipments error:", error);
    shipmentsTableBody.innerHTML =
      '<tr><td colspan="6" style="color:red;">Error loading shipments</td></tr>';
    return;
  }

  if (!data || data.length === 0) {
    shipmentsTableBody.innerHTML =
      '<tr><td colspan="6">No shipments yet.</td></tr>';
    return;
  }

  shipmentsTableBody.innerHTML = "";
  data.forEach((ship) => {
    const tr = document.createElement("tr");

    const updatedText = ship.updated_at
      ? new Date(ship.updated_at).toLocaleString()
      : "";

    tr.innerHTML = `
      <td>${ship.tracking_id}</td>
      <td>${ship.origin ?? ""}</td>
      <td>${ship.destination ?? ""}</td>
      <td>${ship.status ?? ""}</td>
      <td>${updatedText}</td>
      <td class="actions">
        <button class="btn-sm" data-action="edit" data-id="${ship.id}">Edit</button>
        <button class="btn-sm deleteBtn" data-action="delete" data-id="${ship.id}">Delete</button>
      </td>
    `;

    shipmentsTableBody.appendChild(tr);
  });
}

async function loadContactMessages() {
  contactTableBody.innerHTML =
    '<tr><td colspan="6">Loading messages...</td></tr>';

  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load messages error:", error);
    contactTableBody.innerHTML =
      '<tr><td colspan="6" style="color:red;">Error loading messages</td></tr>';
    return;
  }

  if (!data || data.length === 0) {
    contactTableBody.innerHTML =
      '<tr><td colspan="6">No messages yet.</td></tr>';
    return;
  }

  contactTableBody.innerHTML = "";
  data.forEach((msg) => {
    const created = msg.created_at
      ? new Date(msg.created_at).toLocaleString()
      : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${created}</td>
      <td>${msg.name}</td>
      <td>${msg.email}</td>
      <td>${msg.service ?? ""}</td>
      <td>${msg.phone ?? ""}</td>
      <td>${msg.message}</td>
    `;
    contactTableBody.appendChild(tr);
  });
}

/* ===================== MODAL HELPERS ===================== */

function openShipmentModal(mode, shipment = null) {
  shipmentModal.style.display = "flex";

  if (mode === "edit" && shipment) {
    editingShipmentId = shipment.id;
    shipmentModalTitle.textContent = "Edit Shipment";
    trackingInput.value = shipment.tracking_id ?? "";
    trackingInput.disabled = true; // tracking ID stays fixed
    originInput.value = shipment.origin ?? "";
    destinationInput.value = shipment.destination ?? "";
    statusInput.value = shipment.status ?? "";
    descriptionInput.value = shipment.description ?? "";
  } else {
    editingShipmentId = null;
    shipmentModalTitle.textContent = "Create Shipment";
    trackingInput.disabled = false;
    trackingInput.value = "";
    originInput.value = "";
    destinationInput.value = "";
    statusInput.value = "";
    descriptionInput.value = "";
  }
}

function closeShipmentModal() {
  shipmentModal.style.display = "none";
}

/* ===================== SAVE / DELETE ===================== */

async function saveShipment() {
  const tracking_id = trackingInput.value.trim();
  const origin = originInput.value.trim();
  const destination = destinationInput.value.trim();
  const status = statusInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!tracking_id) {
    alert("Tracking ID is required");
    return;
  }

  let error;

  if (editingShipmentId) {
    ({ error } = await supabase
      .from("shipments")
      .update({ origin, destination, status, description })
      .eq("id", editingShipmentId));
  } else {
    ({ error } = await supabase.from("shipments").insert([
      { tracking_id, origin, destination, status, description },
    ]));
  }

  if (error) {
    console.error("Save shipment error:", error);
    alert("Error saving shipment");
    return;
  }

  closeShipmentModal();
  await loadShipments();
}

async function deleteShipment(id) {
  if (!confirm("Are you sure you want to delete this shipment?")) return;

  const { error } = await supabase.from("shipments").delete().eq("id", id);
  if (error) {
    console.error("Delete shipment error:", error);
    alert("Error deleting shipment");
    return;
  }

  await loadShipments();
}

/* ===================== EVENT BINDINGS ===================== */

if (addShipmentBtn) {
  addShipmentBtn.addEventListener("click", () => openShipmentModal("create"));
}

if (closeShipmentModalBtn) {
  closeShipmentModalBtn.addEventListener("click", closeShipmentModal);
}
if (cancelShipmentBtn) {
  cancelShipmentBtn.addEventListener("click", closeShipmentModal);
}
if (saveShipmentBtn) {
  saveShipmentBtn.addEventListener("click", saveShipment);
}

// Delegated events for edit/delete
if (shipmentsTableBody) {
  shipmentsTableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action || !id) return;

    if (action === "edit") {
      // fetch current shipment
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        console.error("Load single shipment error:", error);
        alert("Could not load shipment for editing");
        return;
      }
      openShipmentModal("edit", data);
    } else if (action === "delete") {
      await deleteShipment(id);
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "admin-login.html";
  });
}

/* ===================== INIT ===================== */

(async function init() {
  const user = await requireAuth();
  if (!user) return;

  if (adminEmailDisplay) adminEmailDisplay.textContent = user.email || "";

  await loadShipments();
  await loadContactMessages();
})();
