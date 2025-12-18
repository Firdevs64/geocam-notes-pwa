/* ===========================
   ONLINE / OFFLINE BADGE
=========================== */
const netBadge = document.getElementById("netBadge");
function updateNet() {
  const online = navigator.onLine;
  netBadge.textContent = online ? "Online" : "Offline";
  netBadge.classList.toggle("off", !online);
}
window.addEventListener("online", updateNet);
window.addEventListener("offline", updateNet);
updateNet();

/* ===========================
   LOCAL STORAGE (SAFE)
=========================== */
const KEY = "geocam_notes_v1";

function loadNotes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("loadNotes error:", e);
    localStorage.removeItem(KEY);
    return [];
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
    const test = localStorage.getItem(KEY);
    if (!test) throw new Error("Write failed");
    return true;
  } catch (e) {
    console.error("saveNotes failed:", e);
    alert(
      "Kaydedilemedi ❌\n" +
      "Sebep: " + (e.name || "") + " " + (e.message || "") +
      "\n\nFotoğraf çok büyük olabilir."
    );
    return false;
  }
}

/* ===========================
   ROUTER / VIEW
=========================== */
const view = document.getElementById("view");

function HomeView() {
  const notes = loadNotes();
  return `
    <section class="card">
      <h2>Home</h2>
      <p>${navigator.onLine ? "Internet is available." : "No internet, but your notes still work."}</p>
      <div class="row">
        <button class="half" id="goCapture">Add Photo + Note</button>
        <button class="half" id="goLoc">View Location</button>
      </div>
    </section>

    <section class="card">
      <h3>Records</h3>
      ${notes.length === 0 ? "<p>No records yet.</p>" : notes.map((n, i) => `
        <div class="note card" style="background:#0f172a">
          <b>${new Date(n.createdAt).toLocaleString()}</b>
          <p>${escapeHtml(n.text || "")}</p>
          ${n.imageDataUrl ? `<img src="${n.imageDataUrl}" class="noteImg"/>` : ""}
          ${n.location ? `<p class="muted">📍 ${n.location.lat.toFixed(5)}, ${n.location.lng.toFixed(5)}</p>` : ""}
          <button data-del="${i}">Delete</button>
        </div>
      `).join("")}
    </section>
  `;
}

function CaptureView() {
  return `
    <section class="card">
      <h2>Capture</h2>

      <label>Photo</label>
      <input id="photo" type="file" accept="image/*"/>

      <label>Note</label>
      <textarea id="noteText" rows="4"></textarea>

      <div class="row">
        <button class="half" id="getLoc">Get Location</button>
        <button class="half" id="save">Save</button>
      </div>

      <p id="locInfo"></p>
      <div id="preview"></div>
    </section>
  `;
}

function LocationView() {
  const notes = loadNotes();
  const last = notes[0];
  return `
    <section class="card">
      <h2>Location</h2>
      ${last?.location
        ? `<p>📍 ${last.location.lat}, ${last.location.lng}</p>`
        : "<p>No location saved.</p>"}
    </section>
  `;
}

function render() {
  const hash = location.hash || "#/";
  if (hash === "#/") view.innerHTML = HomeView();
  else if (hash === "#/capture") view.innerHTML = CaptureView();
  else if (hash === "#/location") view.innerHTML = LocationView();
  bindEvents();
}
window.addEventListener("hashchange", render);
render();

/* ===========================
   EVENTS
=========================== */
let tempLocation = null;
let tempImageDataUrl = null;

function bindEvents() {
  const goCapture = document.getElementById("goCapture");
  if (goCapture) goCapture.onclick = () => location.hash = "#/capture";

  const goLoc = document.getElementById("goLoc");
  if (goLoc) goLoc.onclick = () => location.hash = "#/location";

  const photo = document.getElementById("photo");
  if (photo) {
    photo.onchange = async () => {
      const file = photo.files?.[0];
      if (!file) return;
      tempImageDataUrl = await fileToDataUrl(file);
      document.getElementById("preview").innerHTML =
        `<img src="${tempImageDataUrl}" style="width:100%;border-radius:12px"/>`;
    };
  }

  const getLoc = document.getElementById("getLoc");
  if (getLoc) getLoc.onclick = async () => {
    try {
      tempLocation = await getLocation();
      document.getElementById("locInfo").textContent =
        `📍 ${tempLocation.lat.toFixed(5)}, ${tempLocation.lng.toFixed(5)}`;
    } catch {
      document.getElementById("locInfo").textContent = "Location error";
    }
  };

  const saveBtn = document.getElementById("save");
  if (saveBtn) saveBtn.onclick = () => {
    const text = document.getElementById("noteText").value.trim();
    const notes = loadNotes();

    notes.unshift({
      createdAt: Date.now(),
      text,
      imageDataUrl: tempImageDataUrl || null,
      location: tempLocation || null
    });

    const ok = saveNotes(notes);
    if (!ok) return;

    tempLocation = null;
    tempImageDataUrl = null;
    location.hash = "#/";
  };

  document.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.del);
      const notes = loadNotes();
      notes.splice(i, 1);
      saveNotes(notes);
      render();
    };
  });
}

/* ===========================
   HELPERS
=========================== */
function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function fileToDataUrl(file) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });

  const maxW = 360;
  const quality = 0.45;

  const ratio = Math.min(1, maxW / img.width);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);

  URL.revokeObjectURL(img.src);
  return canvas.toDataURL("image/jpeg", quality);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c])
  );
}

/* ===========================
   SERVICE WORKER
=========================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
