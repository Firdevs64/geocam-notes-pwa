/* ===========================
   ONLINE / OFFLINE BADGE
=========================== */
const netBadge = document.getElementById("netBadge");
function updateNet() {
  if (!netBadge) return;
  const online = navigator.onLine;
  netBadge.textContent = online ? "Online" : "Offline";
  netBadge.classList.toggle("off", !online);
}
window.addEventListener("online", updateNet);
window.addEventListener("offline", updateNet);
updateNet();

/* ===========================
   STORAGE (SAFE)
=========================== */
const KEY = "geocam_notes_v1";

function loadNotes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("loadNotes parse error:", e);
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
      "Sebep: " + (e?.name || "") + " " + (e?.message || e) +
      "\n\nFotoğraf çok büyük olabilir. Daha küçük bir foto seçmeyi dene."
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
      ${
        notes.length === 0
          ? "<p>No records yet.</p>"
          : notes.map((n, i) => `
            <div class="note card" style="background:#0f172a">
              <div class="noteHead">
                <b>${new Date(n.createdAt).toLocaleString()}</b>
                <div class="noteActions">
                  <button class="btn" data-edit="${i}" title="Edit">Edit</button>
                  <button class="btn danger" data-del="${i}" title="Delete">Delete</button>
                </div>
              </div>

              <p>${escapeHtml(n.text || "")}</p>

              ${
                n.imageDataUrl
                  ? `<img alt="photo" src="${n.imageDataUrl}" class="noteImg" data-full="${n.imageDataUrl}" />`
                  : ""
              }

              ${
                n.location
                  ? `<p class="muted">📍 ${Number(n.location.lat).toFixed(5)}, ${Number(n.location.lng).toFixed(5)}</p>`
                  : "<p class='muted'>📍 No location</p>"
              }
            </div>
          `).join("")
      }
    </section>
  `;
}

function CaptureView() {
  return `
    <section class="card">
      <h2>Capture</h2>
      <p>Native features: Camera (photo), Location (GPS), Microphone (speech-to-text).</p>

      <label>Photo (can open camera)</label>
      <input id="photo" type="file" accept="image/*" capture="environment"/>

      <label style="margin-top:10px;display:block">Note</label>
      <textarea id="noteText" rows="4" placeholder="What are we saving today?"></textarea>

      <div class="row" style="margin-top:10px">
        <button class="half" id="micBtn">🎙 Write by speaking</button>
        <button class="half" id="stopMicBtn" disabled>⏹ Stop</button>
      </div>
      <p id="micInfo" class="muted"></p>

      <div class="row" style="margin-top:10px">
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
  const loc = last?.location;
  return `
    <section class="card">
      <h2>Location</h2>
      <p>Last record location:</p>
      ${loc ? `<p>📍 ${loc.lat}, ${loc.lng}</p>` : "<p>No location found. Get location in Capture and save.</p>"}
      <button id="refreshLoc">Get location now (without saving)</button>
      <p id="liveLoc"></p>
    </section>
  `;
}

function setActiveTab() {
  document.querySelectorAll(".tabs a").forEach(a => a.classList.remove("active"));
  const hash = location.hash || "#/";
  const active = document.querySelector(`.tabs a[href="${hash}"]`);
  if (active) active.classList.add("active");
}

function render() {
  if (!view) return;

  const hash = location.hash || "#/";
  setActiveTab();

  if (hash === "#/") view.innerHTML = HomeView();
  else if (hash === "#/capture") view.innerHTML = CaptureView();
  else if (hash === "#/location") view.innerHTML = LocationView();
  else view.innerHTML = `<section class="card"><h2>404</h2><p>Sayfa yok.</p></section>`;

  bindEvents();
}
window.addEventListener("hashchange", render);
render();

/* ===========================
   STATE
=========================== */
let tempLocation = null;
let tempImageDataUrl = null;

/* ===========================
   EVENTS
=========================== */
function bindEvents() {
  const goCapture = document.getElementById("goCapture");
  if (goCapture) goCapture.onclick = () => (location.hash = "#/capture");

  const goLoc = document.getElementById("goLoc");
  if (goLoc) goLoc.onclick = () => (location.hash = "#/location");

  const photo = document.getElementById("photo");
  if (photo) {
    photo.onchange = async () => {
      const file = photo.files?.[0];
      if (!file) return;

      // Base64 + aggressive compress (localStorage friendly)
      tempImageDataUrl = await fileToDataUrl(file);

      const preview = document.getElementById("preview");
      if (preview) {
        preview.innerHTML = `
          <img alt="preview" src="${tempImageDataUrl}"
               style="width:100%;border-radius:12px;border:1px solid #334155" />
        `;
      }
    };
  }

  const getLoc = document.getElementById("getLoc");
  if (getLoc) {
    getLoc.onclick = async () => {
      const locInfo = document.getElementById("locInfo");
      try {
        tempLocation = await getLocation();
        if (locInfo) {
          locInfo.textContent = `📍 ${tempLocation.lat.toFixed(5)}, ${tempLocation.lng.toFixed(5)}`;
        }
      } catch {
        if (locInfo) {
          locInfo.textContent =
            "Location could not be obtained (you may not have granted permission).";
        }
      }
    };
  }

  const saveBtn = document.getElementById("save");
  if (saveBtn) {
    saveBtn.onclick = () => {
      const text = (document.getElementById("noteText")?.value || "").trim();
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
  }

  const refreshLoc = document.getElementById("refreshLoc");
  if (refreshLoc) {
    refreshLoc.onclick = async () => {
      const out = document.getElementById("liveLoc");
      if (out) out.textContent = "Obtaining location...";
      try {
        const loc = await getLocation();
        if (out) out.textContent = `📍 ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
      } catch {
        if (out) out.textContent = "Location could not be obtained.";
      }
    };
  }

  // Open image in modal (Home)
  document.querySelectorAll("img[data-full]").forEach(img => {
    img.addEventListener("click", () => {
      openImageModal(img.getAttribute("data-full"));
    });
  });

  // Speech-to-text (Microphone)
  const micBtn = document.getElementById("micBtn");
  const stopMicBtn = document.getElementById("stopMicBtn");
  const micInfo = document.getElementById("micInfo");
  const noteText = document.getElementById("noteText");

  if (micBtn && stopMicBtn && micInfo && noteText) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      micInfo.textContent = "This browser does not support speech-to-text transcription (Chrome is recommended).";
      micBtn.disabled = true;
    } else {
      let rec = null;

      micBtn.onclick = () => {
        rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.interimResults = true;
        rec.continuous = true;

        micInfo.textContent = "I'm listening... you can speak 🎧";
        micBtn.disabled = true;
        stopMicBtn.disabled = false;

        let finalText = noteText.value.trim();
        if (finalText.length > 0) finalText += " ";

        rec.onresult = (event) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalText += transcript + " ";
            else interim += transcript;
          }
          noteText.value = (finalText + interim).trim();
        };

        rec.onerror = () => {
          micInfo.textContent = "A microphone permission/error occurred. Please grant permission and try again.";
          micBtn.disabled = false;
          stopMicBtn.disabled = true;
        };

        rec.onend = () => {
          micInfo.textContent = "It was stopped.";
          micBtn.disabled = false;
          stopMicBtn.disabled = true;
        };

        rec.start();
      };

      stopMicBtn.onclick = () => {
        if (rec) rec.stop();
      };
    }
  }

  // Delete buttons (Home)
  document.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-del"));
      const ok = confirm("Do you want to delete this record?");
      if (!ok) return;

      const notes = loadNotes();
      notes.splice(i, 1);
      saveNotes(notes);
      render();
    });
  });

  // Edit buttons (Home)
  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-edit"));
      const notes = loadNotes();
      const n = notes[i];

      const newText = prompt("Edit note:", n?.text ?? "");
      if (newText === null) return;

      n.text = newText.trim();
      notes[i] = n;
      saveNotes(notes);
      render();
    });
  });
}

/* ===========================
   GEOLOCATION
=========================== */
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/* ===========================
   IMAGE MODAL + ZOOM
=========================== */
let zoom = 1;
let panX = 0, panY = 0, scale = 1;
let startX = 0, startY = 0;
let startPanX = 0, startPanY = 0;
let startDist = 0, startScale = 1;
let isPanning = false;

function openImageModal(src) {
  const modal = document.getElementById("imgModal");
  const pic = document.getElementById("imgModalPic");
  const zin = document.getElementById("zoomIn");
  const zout = document.getElementById("zoomOut");
  const close = document.getElementById("closeImg");

  if (!modal || !pic) return;

  zoom = 1;
  panX = 0;
  panY = 0;
  scale = 1;

  pic.style.transform = `scale(${zoom})`;
  pic.src = src;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  const applyZoom = () => {
    zoom = Math.max(1, Math.min(4, zoom));
    pic.style.transform = `scale(${zoom})`;
  };

  if (zin) zin.onclick = (e) => { e.stopPropagation(); zoom += 0.25; applyZoom(); };
  if (zout) zout.onclick = (e) => { e.stopPropagation(); zoom -= 0.25; applyZoom(); };
  if (close) close.onclick = (e) => { e.stopPropagation(); closeImageModal(); };

  modal.onclick = () => closeImageModal();
  pic.onclick = (e) => e.stopPropagation();
}

function applyTransform(img) {
  img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

function dist(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.hypot(dx, dy);
}

function clampScale(v) {
  return Math.max(1, Math.min(4, v));
}

function enableTouchZoom() {
  const modal = document.getElementById("imgModal");
  const img = document.getElementById("imgModalPic");
  if (!modal || !img) return;

  function reset() {
    panX = 0; panY = 0; scale = 1;
    applyTransform(img);
  }

  img.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isPanning = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startPanX = panX;
      startPanY = panY;
    } else if (e.touches.length === 2) {
      isPanning = false;
      startDist = dist(e.touches[0], e.touches[1]);
      startScale = scale;
    }
  }, { passive: false });

  img.addEventListener("touchmove", (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isPanning && scale > 1) {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      panX = startPanX + dx;
      panY = startPanY + dy;
      applyTransform(img);
    } else if (e.touches.length === 2) {
      const newDist = dist(e.touches[0], e.touches[1]);
      const factor = newDist / startDist;
      scale = clampScale(startScale * factor);
      applyTransform(img);
    }
  }, { passive: false });

  img.addEventListener("touchend", () => {
    isPanning = false;
    if (scale === 1) { panX = 0; panY = 0; applyTransform(img); }
  });

  let lastTap = 0;
  img.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastTap < 300) reset();
    lastTap = now;
  });

  modal._resetImg = reset;
}
enableTouchZoom();

function closeImageModal() {
  const modal = document.getElementById("imgModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

/* ===========================
   IMAGE -> DATAURL (AGGRESSIVE COMPRESS)
=========================== */
async function fileToDataUrl(file) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });

  // Aggressive settings so it fits in localStorage more often
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

/* ===========================
   ESCAPE
=========================== */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[c]));
}

/* ===========================
   SERVICE WORKER
=========================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try { await navigator.serviceWorker.register("./sw.js"); }
    catch (e) { console.warn("SW register failed", e); }
  });
}
