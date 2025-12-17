const netBadge = document.getElementById("netBadge");
function updateNet() {
  const online = navigator.onLine;
  netBadge.textContent = online ? "Online" : "Offline";
  netBadge.classList.toggle("off", !online);
}
window.addEventListener("online", updateNet);
window.addEventListener("offline", updateNet);
updateNet();

const KEY = "geocam_notes_v1";
const loadNotes = () => JSON.parse(localStorage.getItem(KEY) || "[]");
const saveNotes = (notes) => localStorage.setItem(KEY, JSON.stringify(notes));

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
          <div class="noteHead">
            <b>${new Date(n.createdAt).toLocaleString()}</b>
        <div class="noteActions">
            <button class="btn" data-edit="${i}" title="Edit">Edit</button>
            <button class="btn danger" data-del="${i}" title="Delete">Delete</button>
        </div>


          </div>

          <p>${escapeHtml(n.text || "")}</p>

          ${n.imageDataUrl ? `<img alt="foto" src="${n.imageDataUrl}" class="noteImg" />` : ""}

          ${n.location ? `<p class="muted">📍 ${n.location.lat.toFixed(5)}, ${n.location.lng.toFixed(5)}</p>` : "<p class='muted'>📍 No location</p>"}
        </div>
      `).join("")}
    </section>
  `;
}

function CaptureView() {
  return `
    <section class="card">
      <h2>Capture</h2>
      <p>Native features: Camera (photo), Location (GPS), Microphone (speech-to-text).</p>

      <label>Photo (can open camera)</label>
      <input id="photo" type="file" accept="image/*" capture="environment" />

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

let tempLocation = null;
let tempImageDataUrl = null;

function bindEvents() {

      const quickAdd = document.getElementById("quickAdd");
  if (quickAdd) quickAdd.onclick = () => location.hash = "#/capture";

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
        `<img alt="preview" src="${tempImageDataUrl}" style="width:100%;border-radius:12px;border:1px solid #334155" />`;
    };
  }

  const getLoc = document.getElementById("getLoc");
  if (getLoc) getLoc.onclick = async () => {
    try {
      tempLocation = await getLocation();
      document.getElementById("locInfo").textContent =
        `📍 ${tempLocation.lat.toFixed(5)}, ${tempLocation.lng.toFixed(5)}`;
    } catch {
      document.getElementById("locInfo").textContent = "Location could not be obtained (you may not have granted permission).";
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
    saveNotes(notes);
    tempLocation = null;
    tempImageDataUrl = null;
    location.hash = "#/";
  };

  const refreshLoc = document.getElementById("refreshLoc");
  if (refreshLoc) refreshLoc.onclick = async () => {
    const out = document.getElementById("liveLoc");
    out.textContent = "Obtaining location...";
    try {
      const loc = await getLocation();
      out.textContent = `📍 ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
    } catch {
      out.textContent = "Location could not be obtained.";
    }
  };

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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try { await navigator.serviceWorker.register("./sw.js"); }
    catch (e) { console.warn("SW register failed", e); }
  });
}
