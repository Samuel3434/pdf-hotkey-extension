(async () => {
  const SUBJECTS = ["chemistry", "physics", "biology", "math"];
  const UNITS = {
    NINE: {
      biology: {
        17: "Unit-1",
        54: "Unit-2",
        127: "Unit-3",
        175: "Unit-4",
        204: "Unit-5",
        233: "Unit-6",
      },
      chemistry: {
        40: "Unit-1",
        70: "Unit-2",
        100: "Unit-3",
        168: "Unit-4",
        207: "Unit-5",
      },
      physics: {
        19: "Unit-1",
        46: "Unit-2",
        91: "Unit-3",
        120: "Unit-4",
        144: "Unit-5",
        175: "Unit-6",
        211: "Unit-7",
        249: "Unit-8",
      },
      math: {
        69: "Unit-1",
        111: "Unit-2",
        145: "Unit-3",
        181: "Unit-4",
        255: "Unit-5",
        197: "Unit-6",
        321: "Unit-7",
      },
    },
    TEN: {
      biology: {
        23: "Unit-1",
        56: "Unit-2",
        85: "Unit-3",
        100: "Unit-4",
        159: "Unit-5",
        183: "Unit-6",
      },
      chemistry: {
        57: "Unit-1",
        115: "Unit-2",
        172: "Unit-3",
        204: "Unit-4",
        240: "Unit-5",
        307: "Unit-6",
      },
      math: {
        76: "Unit-1",
        130: "Unit-2",
        208: "Unit-3",
        260: "Unit-4",
        296: "Unit-5",
        354: "Unit-6",
        395: "Unit-7",
      },
      physics: {
        27: "Unit-1",
        65: "Unit-2",
        97: "Unit-3",
        157: "Unit-4",
        183: "Unit-5",
        258: "Unit-6",
      },
    },
    ELEVEN: {
      chemistry: {
        76: "Unit-1",
        154: "Unit-2",
        203: "Unit-3",
        232: "Unit-4",
        274: "Unit-5",
        342: "Unit-6",
      },
      math: {
        95: "Unit-1",
        143: "Unit-2",
        249: "Unit-3",
        263: "Unit-4",
        325: "Unit-5",
        367: "Unit-7",
        425: "Unit-8",
      },
      physics: {
        23: "Unit-1",
        53: "Unit-2",
        101: "Unit-3",
        181: "Unit-4",
        223: "Unit-5",
        293: "Unit-7",
      },
      biology: {
        30: "Unit-1",
        83: "Unit-2",
        117: "Unit-3",
        184: "Unit-4",
        240: "Unit-5",
      },
    },
    TWELVE: {
      chemistry: {
        64: "Unit-1",
        143: "Unit-2",
        221: "Unit-3",
        248: "Unit-4",
        299: "Unit-5",
      },
      math: {
        71: "Unit-1",
        169: "Unit-2",
        247: "Unit-3",
        313: "Unit-4",
        427: "Unit-5",
      },
      physics: {
        30: "Unit-1",
        75: "Unit-2",
        123: "Unit-3",
        148: "Unit-4",
        187: "Unit-5",
      },
      biology: {
        44: "Unit-1",
        117: "Unit-2",
        165: "Unit-3",
        240: "Unit-4",
        337: "Unit-5",
        359: "Unit-6",
      },
    },
  };
  if (document.getElementById("clipboard-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "clipboard-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "560px",
    maxWidth: "90vw",
    maxHeight: "85vh",
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139, 92, 246, 0.2)",
    zIndex: 2147483647,
    padding: "20px",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: "14px",
    overflowY: "auto",
    color: "#f8fafc",
    backdropFilter: "blur(10px)",
  });

  const isPDFViewer =
    window.location.pathname.endsWith(".pdf") ||
    document.querySelector('embed[type="application/pdf"]') ||
    document.querySelector('object[type="application/pdf"]');

  function detectSubjectAndGradeFromFilename(filename) {
    if (!filename) return { subject: null, grade: null };
    const lowerFilename = filename.toLowerCase();
    let subject = null,
      grade = null;

    for (const subj of SUBJECTS) {
      if (lowerFilename.includes(subj)) {
        subject = subj.charAt(0).toUpperCase() + subj.slice(1);
        break;
      }
    }

    for (const g of ["NINE", "TEN", "ELEVEN", "TWELVE"]) {
      if (filename.includes(g)) {
        grade = g;
        break;
      }
    }

    return { subject, grade };
  }

  function detectContext() {
    const ctx = { url: location.href || "", title: document.title || "" };
    if (isPDFViewer) {
      const filename = ctx.url.split("/").pop().split("#")[0].split("?")[0];
      if (filename && filename.endsWith(".pdf")) ctx.title = filename;
    }
    const pageMatch =
      ctx.url.match(/[#?](?:.*?page|p)=(\d+)/i) ||
      ctx.url.match(/\/(\d+)\.pdf/i) ||
      ctx.url.match(/#page=(\d+)/i);
    if (pageMatch) ctx.page = Number(pageMatch[1]);
    return ctx;
  }

  function populateUnitOptions(grade, subject) {
    const unitSelect = overlay.querySelector("#unit-suggest");
    unitSelect.innerHTML =
      '<option value="" style="background:#1e293b;color:#f8fafc;">📖 Unit (auto)</option>';

    if (
      grade &&
      subject &&
      UNITS[grade] &&
      UNITS[grade][subject.toLowerCase()]
    ) {
      const units = UNITS[grade][subject.toLowerCase()];
      Object.entries(units).forEach(([page, unitName]) => {
        const option = document.createElement("option");
        option.value = unitName;
        option.textContent = unitName;
        option.dataset.page = page;
        option.style.background = "#1e293b";
        option.style.color = "#f8fafc";
        unitSelect.appendChild(option);
      });
    }
  }

  function detectUnit(grade, subject, page) {
    if (!grade || !subject || !page) return null;
    const units = UNITS[grade]?.[subject.toLowerCase()];
    if (!units) return null;

    const sortedPages = Object.keys(units)
      .map(Number)
      .sort((a, b) => a - b);
    let detectedUnit = null;

    for (let i = 0; i < sortedPages.length; i++) {
      const startPage = sortedPages[i - 1] || 0;
      const endPage = sortedPages[i] || Infinity;

      if (page >= startPage && page < endPage) {
        detectedUnit = units[endPage];
        break;
      }
    }

    return detectedUnit;
  }

  const ctx = detectContext();

  overlay.innerHTML = `
    <div style="margin-bottom:16px;">
      <div style="font-size:20px;font-weight:700;background:linear-gradient(135deg, #a78bfa 0%, #c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px;">
        Clipboard Capture ${isPDFViewer ? "📄" : "✨"}
      </div>
      <div style="font-size:12px;color:#cbd5e1;">Save and organize your content snippets</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr auto;gap:10px;margin-bottom:14px;">
      <input id="file-name" placeholder="📁 File name (auto-detected)" 
        style="padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(139, 92, 246, 0.3);border-radius:10px;color:#f8fafc;font-size:13px;transition:all 0.2s;"
        value="${escapeHtml(ctx.title || "")}">
      <input id="page-num" placeholder="📄 Page" 
        style="width:100px;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(139, 92, 246, 0.3);border-radius:10px;color:#f8fafc;font-size:13px;text-align:center;transition:all 0.2s;"
        value="${ctx.page ? ctx.page : ""}">
    </div>

    <style>
      select option {
        background: #1e293b !important;
        color: #f8fafc !important;
      }
    </style>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
      <select id="grade-suggest" 
        style="padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(139, 92, 246, 0.3);border-radius:10px;color:#f8fafc;font-size:13px;cursor:pointer;">
        <option value="" style="background:#1e293b;color:#f8fafc;">🎓 Grade</option>
        <option value="NINE" style="background:#1e293b;color:#f8fafc;">Grade NINE</option>
        <option value="TEN" style="background:#1e293b;color:#f8fafc;">Grade TEN</option>
        <option value="ELEVEN" style="background:#1e293b;color:#f8fafc;">Grade ELEVEN</option>
        <option value="TWELVE" style="background:#1e293b;color:#f8fafc;">Grade TWELVE</option>
      </select>
      <select id="subject-suggest" 
        style="padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(139, 92, 246, 0.3);border-radius:10px;color:#f8fafc;font-size:13px;cursor:pointer;">
        <option value="" style="background:#1e293b;color:#f8fafc;">📚 Subject</option>
        <option value="biology" style="background:#1e293b;color:#f8fafc;">Biology</option>
        <option value="chemistry" style="background:#1e293b;color:#f8fafc;">Chemistry</option>
        <option value="physics" style="background:#1e293b;color:#f8fafc;">Physics</option>
        <option value="math" style="background:#1e293b;color:#f8fafc;">Mathematics</option>
      </select>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
      <select id="unit-suggest" 
        style="padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(139, 92, 246, 0.3);border-radius:10px;color:#f8fafc;font-size:13px;cursor:pointer;">
        <option value="" style="background:#1e293b;color:#f8fafc;">📖 Unit (auto)</option>
      </select>
      <select id="type-suggest" 
        style="padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(139, 92, 246, 0.3);border-radius:10px;color:#f8fafc;font-size:13px;cursor:pointer;">
        <option value="auto" style="background:#1e293b;color:#f8fafc;">❓ Question Type: Auto</option>
        <option value="mcq" style="background:#1e293b;color:#f8fafc;">MCQ</option>
        <option value="fill" style="background:#1e293b;color:#f8fafc;">Fill-in</option>
        <option value="short" style="background:#1e293b;color:#f8fafc;">Short answer</option>
        <option value="tf" style="background:#1e293b;color:#f8fafc;">True/False</option>
        <option value="match" style="background:#1e293b;color:#f8fafc;">Match</option>

      </select>
    </div>

    <div style="margin-bottom:14px;">
      <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;font-weight:500;">
        ${isPDFViewer ? "📋 Click below and paste (Ctrl+V):" : "📝 Content"}
      </div>
      <textarea id="copied-text" 
        style="width:100%;height:140px;padding:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(139, 92, 246, 0.2);border-radius:10px;resize:vertical;color:#f8fafc;font-family:monospace;font-size:12px;line-height:1.5;"
        placeholder="${
          isPDFViewer
            ? "Click here and paste with Ctrl+V..."
            : "Paste or type content here..."
        }"></textarea>
    </div>

    <div id="ai-output" 
      style="margin-bottom:14px;padding:12px;border-radius:10px;background:rgba(139, 92, 246, 0.1);border:1px solid rgba(139, 92, 246, 0.3);min-height:50px;font-size:12px;color:#e2e8f0;">
      ${
        isPDFViewer
          ? "📄 PDF detected: Please paste manually with Ctrl+V"
          : "⏳ Loading clipboard content..."
      }
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
      <button id="save-btn"
        style="padding:12px;background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;box-shadow:0 4px 12px rgba(139, 92, 246, 0.3);">
        💾 Save
      </button>
      <button id="export-btn" 
        style="padding:12px;background:rgba(34, 197, 94, 0.2);color:#86efac;border:1px solid rgba(34, 197, 94, 0.3);border-radius:10px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;">
        📤 Export
      </button>
      <button id="close-btn" 
        style="padding:12px;background:rgba(239, 68, 68, 0.2);color:#fca5a5;border:1px solid rgba(239, 68, 68, 0.3);border-radius:10px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;">
        ✕ Close
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const textarea = overlay.querySelector("#copied-text");
  const filenameInput = overlay.querySelector("#file-name");
  const subjectSelect = overlay.querySelector("#subject-suggest");
  const gradeSelect = overlay.querySelector("#grade-suggest");
  const pageInput = overlay.querySelector("#page-num");
  const unitSelect = overlay.querySelector("#unit-suggest");

  // Add input focus effects
  [filenameInput, pageInput, textarea].forEach((el) => {
    el.addEventListener("focus", () => {
      el.style.borderColor = "rgba(139, 92, 246, 0.6)";
      el.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
    });
    el.addEventListener("blur", () => {
      el.style.borderColor = "rgba(139, 92, 246, 0.3)";
      el.style.boxShadow = "none";
    });
  });

  // Add hover effects to buttons
  [
    overlay.querySelector("#save-btn"),
    overlay.querySelector("#export-btn"),
    overlay.querySelector("#close-btn"),
  ].forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-2px)";
      btn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0)";
      btn.style.boxShadow =
        btn.id === "save-btn" ? "0 4px 12px rgba(139, 92, 246, 0.3)" : "none";
    });
  });

  function updateUnitDetection() {
    const grade = gradeSelect.value;
    const subject = subjectSelect.value;
    const page = pageInput.value.trim();

    populateUnitOptions(grade, subject);

    if (grade && subject && page) {
      const detectedUnit = detectUnit(grade, subject, parseInt(page));
      if (detectedUnit) {
        unitSelect.value = detectedUnit;
        const aiOutput = overlay.querySelector("#ai-output");
        aiOutput.textContent = `✨ Auto-detected: ${detectedUnit}`;
        aiOutput.style.background = "rgba(34, 197, 94, 0.1)";
        aiOutput.style.borderColor = "rgba(34, 197, 94, 0.3)";
        setTimeout(() => {
          aiOutput.style.background = "rgba(139, 92, 246, 0.1)";
          aiOutput.style.borderColor = "rgba(139, 92, 246, 0.3)";
        }, 2000);
      } else {
        unitSelect.value = "";
        const aiOutput = overlay.querySelector("#ai-output");
        aiOutput.textContent = `⛔ Unit Can't Be Found`;
        aiOutput.style.background = "rgba(34, 197, 94, 0.1)";
        aiOutput.style.borderColor = "rgba(34, 197, 94, 0.3)";
        setTimeout(() => {
          aiOutput.style.background = "rgba(139, 92, 246, 0.1)";
          aiOutput.style.borderColor = "rgba(139, 92, 246, 0.3)";
        }, 2000);
      }
    }
    updateSaveButtonState();
  }

  function updateSubjectFromFilename() {
    const filename = filenameInput.value.trim();
    const { subject, grade } = detectSubjectAndGradeFromFilename(filename);

    if (grade && !gradeSelect.value) gradeSelect.value = grade;
    if (subject && !subjectSelect.value) {
      subjectSelect.value = subject.toLowerCase();
      const aiOutput = overlay.querySelector("#ai-output");
      aiOutput.textContent = `🎯 Auto-detected: ${subject}`;
      setTimeout(() => {
        if (aiOutput.textContent.includes("Auto-detected")) {
          aiOutput.textContent = "Ready to save snippet";
        }
      }, 2000);
    }

    updateUnitDetection();
  }

  setTimeout(updateSubjectFromFilename, 100);
  filenameInput.addEventListener("input", updateSubjectFromFilename);
  gradeSelect.addEventListener("change", updateUnitDetection);
  subjectSelect.addEventListener("change", updateUnitDetection);
  pageInput.addEventListener("input", updateUnitDetection);
  unitSelect.addEventListener("change", updateSaveButtonState);
  overlay
    .querySelector("#page-num")
    .addEventListener("input", updateSaveButtonState);
  overlay
    .querySelector("#subject-suggest")
    .addEventListener("change", updateSaveButtonState);

  overlay
    .querySelector("#close-btn")
    .addEventListener("click", () => overlay.remove());

  if (isPDFViewer) {
    textarea.focus();
    overlay.querySelector("#ai-output").textContent =
      "📄 PDF detected: Please paste manually with Ctrl+V";
  } else {
    try {
      const prevFocus = document.activeElement;
      const tempTextarea = document.createElement("textarea");
      tempTextarea.style.position = "fixed";
      tempTextarea.style.opacity = "0";
      tempTextarea.style.pointerEvents = "none";
      document.body.appendChild(tempTextarea);
      tempTextarea.focus();

      let text = "";
      try {
        text = await navigator.clipboard.readText();
      } catch (e) {
        try {
          document.execCommand("paste");
          text = tempTextarea.value;
        } catch (e2) {
          text = "";
        }
      }

      tempTextarea.remove();
      if (prevFocus && typeof prevFocus.focus === "function") {
        try {
          prevFocus.focus();
        } catch (e) {}
      }

      if (text) {
        textarea.value = text;
        overlay.querySelector("#ai-output").textContent =
          "✅ Clipboard content loaded";
      } else {
        overlay.querySelector("#ai-output").textContent =
          "📋 Please paste content manually";
        textarea.focus();
      }
    } catch (e) {
      overlay.querySelector("#ai-output").textContent =
        "📋 Please paste content manually";
      textarea.focus();
    }
  }

  overlay.querySelector("#save-btn").addEventListener("click", async () => {
    const txt = overlay.querySelector("#copied-text").value.trim();
    if (!txt) {
      overlay.querySelector("#ai-output").textContent =
        "⚠️ Nothing to save. Please paste text first.";
      return;
    }

    const fileName =
      overlay.querySelector("#file-name").value.trim() ||
      document.title ||
      window.location.pathname.split("/").pop();
    let pageVal = overlay.querySelector("#page-num").value.trim();

    if (!pageVal && isPDFViewer) {
      const pdfPage = tryDetectPDFPage();
      if (pdfPage) pageVal = String(pdfPage);
    }

    const subject = overlay.querySelector("#subject-suggest").value || null;
    const qType = overlay.querySelector("#type-suggest").value || "auto";
    const unit = overlay.querySelector("#unit-suggest").value || null;
    const grade = overlay.querySelector("#grade-suggest").value || null;

    if (!pageVal) {
      overlay.querySelector("#ai-output").textContent =
        "⚠️ Please enter a page number";
      return;
    }
    if (!unit) {
      overlay.querySelector("#ai-output").textContent =
        "⚠️ Please enter a Unit";
      return;
    }

    if (!subject) {
      overlay.querySelector("#ai-output").textContent =
        "⚠️ Please select a subject";
      return;
    }

    const inputHash = await computeHash(
      `${fileName}|${pageVal || ""}|${subject || ""}|${qType}|${txt}`
    );

    const record = {
      id: `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      raw_text: txt,
      file_name: fileName,
      page: pageVal ? Number(pageVal) : null,
      grade: grade,
      unit: unit,
      url: window.location.href,
      subject,
      questionTypeRequest: qType,
      capture_method: "overlay",
      inputHash,
      timestamp: new Date().toISOString(),
      exported: false,
    };

    chrome.runtime.sendMessage(
      { action: "save-snippet", payload: record },
      (resp) => {
        if (resp && resp.ok) {
          overlay.querySelector("#ai-output").textContent = `✅ Saved! Total: ${
            resp.total || "?"
          }\n
          Exported: ${resp.exported || "0"}`;
        } else {
          overlay.querySelector("#ai-output").textContent = "✅ Saved!";
        }
      }
    );
    setTimeout(() => overlay.querySelector("#close-btn").click(), 1500);
  });

  overlay.querySelector("#export-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "export-snippets" }, (resp) => {
      if (resp && resp.ok) {
        overlay.querySelector(
          "#ai-output"
        ).textContent = `📤 Exported ${resp.exported} snippet(s)`;
      } else {
        overlay.querySelector("#ai-output").textContent =
          resp?.message || "📤 Export completed";
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.remove();
  });

  function updateSaveButtonState() {
    const pageVal = overlay.querySelector("#page-num").value.trim();
    const subject = overlay.querySelector("#subject-suggest").value;
    const saveBtn = overlay.querySelector("#save-btn");
    const unitVal = overlay.querySelector("#unit-suggest").value;
    console.log(unitVal);
    const isEnabled = isPDFViewer
      ? pageVal && subject && unitVal
      : subject && unitVal;
    saveBtn.disabled = !isEnabled;
    saveBtn.style.opacity = isEnabled ? "1" : "0.5";
    saveBtn.style.cursor = isEnabled ? "pointer" : "not-allowed";
  }

  updateSaveButtonState();

  function tryDetectPDFPage() {
    try {
      const chromePageSelector = ".page";
      if (document.querySelector(chromePageSelector)) {
        const pages = document.querySelectorAll(chromePageSelector);
        for (let i = 0; i < pages.length; i++) {
          const rect = pages[i].getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight) return i + 1;
        }
      }

      const firefoxPage = document.querySelector(".page[data-page-number]");
      if (firefoxPage)
        return parseInt(firefoxPage.getAttribute("data-page-number"));

      const hashPage = window.location.hash.match(/page=(\d+)/i);
      if (hashPage) return parseInt(hashPage[1]);
    } catch (e) {}
    return null;
  }

  async function computeHash(str) {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      return "h-" + (str.length + "-" + Math.random().toString(36).slice(2, 6));
    }
  }
})();
