(() => {
  // Remove old overlay if it already exists
  const existing = document.getElementById("snippets-overlay");
  if (existing) existing.remove();

  // Create overlay container
  const overlay = document.createElement("div");
  overlay.id = "snippets-overlay";
  overlay.innerHTML = `
    <div class="overlay-content">
      <div class="overlay-header">
        <h2>✨ Snippets Viewer</h2>
        <button id="close-overlay">✕</button>
      </div>
      
      <div class="filters">
        <select id="filter-subject">
          <option value="">All Subjects</option>
          <option value="physics">Physics</option>
          <option value="math">Math</option>
          <option value="biology">Biology</option>
          <option value="chemistry">Chemistry</option>
        </select>
        <select id="filter-grade">
          <option value="">All Grades</option>
          <option value="NINE">Grade 9</option>
          <option value="TEN">Grade 10</option>
          <option value="ELEVEN">Grade 11</option>
          <option value="TWELVE">Grade 12</option>
        </select>
        <input id="filter-page" type="number" style="width:0.7rem" min="1" />
        <select id="filter-exported" >
          <option value="">All</option>
          <option value="true">Exported</option>
          <option value="false" selected >Not Exported</option>
        </select>
        <button id="apply-filters" class="btn-primary">Filter</button>
        <button id="clear-filters" class="btn-secondary">Clear</button>
        <span id="total-question-view"></span>
        <span id="total-filtered-question-view"></span>
        <div class="pagination">
            <button id="prev-page" class="btn-secondary">← Previous</button>
            <span id="page-info">Page 1 of 1</span>
            <button id="next-page" class="btn-secondary">Next →</button>
        </div>
        </div>
      </div>
      
      <div class="content-area">
        <!-- List View -->
        <div class="list-view" id="list-view">
          <table id="snippets-table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Subject</th>
                <th>Unit</th>
                <th>Page</th>
                <th>Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="snippets-body">
              <tr><td colspan="6">Loading snippets...</td></tr>
            </tbody>
          </table>
          
        </div>
        
        <!-- Detail View (hidden by default) -->
        <div class="detail-view" id="detail-view" style="display: none;">
          <div class="detail-header">
            <button id="back-to-list" class="btn-secondary">← Back to List</button>
            <div class="detail-actions">
              <button id="edit-snippet" class="btn-secondary">Edit</button>
              <button id="delete-snippet" class="btn-danger">Delete</button>
            </div>
          </div>
          <div class="detail-body">
            <div class="detail-section">
              <h3>Basic Information</h3>
              <div class="detail-grid">
                <div class="detail-field">
                  <label>Grade:</label>
                  <span id="detail-grade">-</span>
                </div>
                <div class="detail-field">
                  <label>Subject:</label>
                  <span id="detail-subject">-</span>
                </div>
                <div class="detail-field">
                  <label>Unit:</label>
                  <span id="detail-unit">-</span>
                </div>
                <div class="detail-field">
                  <label>Page:</label>
                  <span id="detail-page">-</span>
                </div>
                <div class="detail-field">
                  <label>Question Type:</label>
                  <span id="detail-question-type">-</span>
                </div>
                <div class="detail-field">
                  <label>File Name:</label>
                  <span id="detail-file-name">-</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Content</h3>
              <div id="detail-text" class="snippet-text">-</div>
            </div>
            
            <div class="detail-section">
              <h3>Metadata</h3>
              <div class="detail-grid">
                <div class="detail-field">
                  <label>Captured:</label>
                  <span id="detail-timestamp">-</span>
                </div>
                <div class="detail-field">
                  <label>Capture Method:</label>
                  <span id="detail-capture-method">-</span>
                </div>
                <div class="detail-field">
                  <label>Input Hash:</label>
                  <span id="detail-input-hash" class="hash-value">-</span>
                </div>
                <div class="detail-field">
                  <label>URL:</label>
                  <a id="detail-url" target="_blank" class="url-link">View Source</a>
                </div>
                <div class="detail-field">
                  <label>Exported:</label>
                  <span id="detail-exported">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Edit Modal -->
      <div id="edit-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">Edit Snippet</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="snippet-form">
              <input type="hidden" id="edit-id">
              <div class="form-row">
                <div class="form-group">
                  <label for="edit-grade">Grade:</label>
                  <select id="edit-grade" required>
                    <option value="">Select Grade</option>
                    <option value="NINE">Grade 9</option>
                    <option value="TEN">Grade 10</option>
                    <option value="ELEVEN">Grade 11</option>
                    <option value="TWELVE">Grade 12</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="edit-subject">Subject:</label>
                  <select id="edit-subject" required>
                    <option value="">Select Subject</option>
                    <option value="physics">Physics</option>
                    <option value="math">Math</option>
                    <option value="biology">Biology</option>
                    <option value="chemistry">Chemistry</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="edit-unit">Unit:</label>
                  <input type="text" id="edit-unit">
                </div>
                <div class="form-group">
                  <label for="edit-page">Page:</label>
                  <input type="number" id="edit-page" min="1">
                </div>
              </div>
              <div class="form-group">
                <label for="edit-question-type">Question Type:</label>
                <select id="edit-question-type">
                    <option value="auto" style="background:#1e293b;color:#f8fafc;">❓ Question Type: Auto</option>
                    <option value="mcq" style="background:#1e293b;color:#f8fafc;">MCQ</option>
                    <option value="fill" style="background:#1e293b;color:#f8fafc;">Fill-in</option>
                    <option value="short" style="background:#1e293b;color:#f8fafc;">Short answer</option>
                    <option value="tf" style="background:#1e293b;color:#f8fafc;">True/False</option>
                    <option value="match" style="background:#1e293b;color:#f8fafc;">Match</option>
                </select>
              </div>
              <div class="form-group">
                <label for="edit-file-name">File Name:</label>
                <input type="text" id="edit-file-name">
              </div>
              <div class="form-group">
                <label for="edit-text">Content:</label>
                <textarea id="edit-text" rows="8" required></textarea>
              </div>
              <div class="form-actions">
                <button type="button" id="cancel-edit" class="btn-secondary">Cancel</button>
                <button type="submit" id="save-snippet" class="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    
  `;

  document.body.appendChild(overlay);

  // Aurora-inspired styles
  const style = document.createElement("style");
  style.textContent = `
    #snippets-overlay { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: #e2e8f0; font-family: 'Segoe UI', system-ui, sans-serif; z-index: 999999; width: 90vw; max-width: 1200px; max-height: 95vh; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .overlay-content { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(94, 234, 212, 0.2); border-radius: 16px; display: flex; flex-direction: column; }
    .overlay-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(94, 234, 212, 0.3); }
    .overlay-header h2 { margin: 0; background: linear-gradient(135deg, #67e8f9, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 700; }
    #close-overlay { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 16px; transition: all 0.3s ease; }
    #close-overlay:hover { background: rgba(239, 68, 68, 0.2); }
    .filters { display: flex; gap: 12px; padding: 16px 24px; border-bottom: 1px solid rgba(94, 234, 212, 0.2); flex-wrap: wrap; align-items: center; }
    .filters input, .filters select { padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(94, 234, 212, 0.3); background: rgba(15, 23, 42, 0.8); color: #e2e8f0; outline: none; transition: all 0.3s ease; min-width: 120px; }
    .filters input:focus, .filters select:focus { border-color: #5eead4; box-shadow: 0 0 0 2px rgba(94, 234, 212, 0.1); }
    .btn-primary { background: linear-gradient(135deg, #5eead4, #38b2ac); color: #0f172a; border: none; border-radius: 6px; padding: 8px 16px; cursor: button; font-weight: 600; transition: all 0.3s ease; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 12px -4px rgba(94, 234, 212, 0.4); }
    .btn-secondary { background: rgba(94, 234, 212, 0.1); color: #5eead4; border: 1px solid rgba(94, 234, 212, 0.3); border-radius: 6px; padding: 8px 16px; cursor: pointer; transition: all 0.3s ease; }
    .btn-secondary:hover { background: rgba(94, 234, 212, 0.2); }
    .btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 8px 16px; cursor: pointer; transition: all 0.3s ease; }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.2); }
    .content-area { padding: 20px 24px; overflow: auto; height: 70vh; }
    .list-view, .detail-view { height: 100%; width: 100%; display: flex; flex-direction: column; }
    table { width: 100%; border-collapse: collapse; background: rgba(15, 23, 42, 0.6); border-radius: 8px; overflow: hidden; margin-bottom: 16px; flex: 1; }
    th { background: linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(167, 139, 250, 0.2)); color: #5eead4; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px; }
    td { padding: 12px 16px; border-bottom: 1px solid rgba(94, 234, 212, 0.1); font-size: 14px; }
    tr:hover { background: rgba(94, 234, 212, 0.05); }
    .action-btn { background: none; border: none; color: #5eead4; cursor: pointer; padding: 6px; border-radius: 4px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
    .action-btn:hover { background: rgba(94, 234, 212, 0.1); transform: scale(1.1); }
    .pagination { align-self: end; display: flex; justify-content: center; align-items: center; gap: 16px; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
    .pagination button:disabled:hover { box-shadow: none; background: rgba(94, 234, 212, 0.1); }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(94, 234, 212, 0.3); }
    .detail-actions { display: flex; gap: 8px; }
    .detail-body { flex: 1; overflow-y: auto; }
    .detail-section { margin-bottom: 32px; }
    .detail-section h3 { color: #5eead4; margin: 0 0 16px 0; font-size: 18px; border-bottom: 1px solid rgba(94, 234, 212, 0.2); padding-bottom: 8px; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
    .detail-field { display: flex; flex-direction: column; gap: 4px; }
    .detail-field label { color: #5eead4; font-weight: 600; font-size: 14px; }
    .detail-field span { color: #e2e8f0; font-size: 14px; }
    .snippet-text { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(94, 234, 212, 0.2); border-radius: 8px; padding: 16px; max-height: 300px; overflow-y: auto; line-height: 1.5; white-space: pre-wrap; font-family: inherit; }
    .hash-value { font-family: monospace; font-size: 12px; word-break: break-all; color: #a5b4fc !important; }
    .url-link { color: #5eead4; text-decoration: none; font-size: 14px; }
    .url-link:hover { text-decoration: underline; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000000; }
    .modal-content { background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(94, 234, 212, 0.3); border-radius: 16px; padding: 24px; width: 600px; max-width: 90vw; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h3 { margin: 0; color: #5eead4; }
    .close-modal { background: none; border: none; color: #ef4444; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
    .form-row { display: flex; gap: 16px; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; color: #5eead4; font-weight: 600; font-size: 14px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid rgba(94, 234, 212, 0.3); border-radius: 8px; background: rgba(15, 23, 42, 0.8); color: #e2e8f0; outline: none; transition: all 0.3s ease; box-sizing: border-box; font-size: 14px; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #5eead4; box-shadow: 0 0 0 2px rgba(94, 234, 212, 0.1); }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    #total-question-view {background: linear-gradient(135deg,#7f5af0,#2cb67d);color:#fff;display:inline-block;padding:6px 12px;border-radius:12px;font-weight:600;font-size:0.9rem;margin-right:8px;font-family:"Inter","Segoe UI",sans-serif;transition:opacity 0.2s ease,transform 0.2s ease;}
    #total-question-view:hover {opacity:0.85;transform:scale(1.05);}
    #total-filtered-question-view {background: linear-gradient(135deg,#00b4d8,#ff5f9e);color:#fff;display:inline-block;padding:6px 12px;border-radius:12px;font-weight:600;font-size:0.9rem;margin-right:8px;font-family:"Inter","Segoe UI",sans-serif;transition:opacity 0.2s ease,transform 0.2s ease;}
    #total-filtered-question-view:hover {opacity:0.85;transform:scale(1.05);}

  `;

  document.head.appendChild(style);

  let currentPage = 1;
  let filters = {};
  let currentSnippet = null;
  let allSnippets = [];

  function loadSnippets() {
    chrome.runtime.sendMessage(
      { action: "view-snippets", filters, page: currentPage },
      (resp) => {
        const body = document.getElementById("snippets-body");
        if (!resp || !resp.snippets || resp.snippets.length === 0) {
          body.innerHTML = `<tr><td colspan="6">No snippets found</td></tr>`;
          allSnippets = [];
          return;
        }

        allSnippets = resp.snippets;
        body.innerHTML = allSnippets
          .map(
            (sn, index) => `
          <tr data-index="${index}">
            <td>${sn.grade || "-"}</td>
            <td>${sn.subject || "-"}</td>
            <td>${sn.unit || "-"}</td>
            <td>${sn.page || "-"}</td>
            <td>${sn.raw_text?.slice(0, 80) || ""}...</td>
            <td>
              <button class="action-btn view-snippet" data-index="${index}" title="View Details">
                👁️
              </button>
            </td>
          </tr>`
          )
          .join("");

        document.getElementById("page-info").textContent = `Page ${
          resp.pagination?.currentPage || 1
        } of ${resp.pagination?.totalPages || 1}`;

        const prevBtn = document.getElementById("prev-page");
        const nextBtn = document.getElementById("next-page");
        const totalQuestion = document.getElementById("total-question-view");
        const totalFilteredQuestion = document.getElementById(
          "total-filtered-question-view"
        );

        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn)
          nextBtn.disabled = currentPage >= (resp.pagination?.totalPages || 1);

        totalQuestion.innerText = resp.pagination?.totalItems;
        totalFilteredQuestion.innerText = resp.pagination?.totalFilteredItems;
        // Add click listeners to eye buttons
        body.querySelectorAll(".view-snippet").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const index = btn.getAttribute("data-index");
            showSnippetDetail(allSnippets[index]);
          });
        });
      }
    );
  }

  function showSnippetDetail(snippet) {
    currentSnippet = snippet.id;

    // Hide list view and show detail view
    document.getElementById("list-view").style.display = "none";
    document.getElementById("detail-view").style.display = "flex";

    // Populate detail fields with all the snippet data
    document.getElementById("detail-grade").textContent = snippet.grade || "-";
    document.getElementById("detail-subject").textContent =
      snippet.subject || "-";
    document.getElementById("detail-unit").textContent = snippet.unit || "-";
    document.getElementById("detail-page").textContent = snippet.page || "-";
    document.getElementById("detail-question-type").textContent =
      snippet.questionTypeRequest || "-";
    document.getElementById("detail-file-name").textContent =
      snippet.file_name || "-";
    document.getElementById("detail-text").textContent =
      snippet.raw_text || "-";
    document.getElementById("detail-timestamp").textContent = new Date(
      snippet.timestamp
    ).toLocaleString();
    document.getElementById("detail-capture-method").textContent =
      snippet.capture_method || "-";
    document.getElementById("detail-input-hash").textContent =
      snippet.inputHash || "-";
    document.getElementById("detail-exported").textContent = snippet.exported
      ? "Yes"
      : "No";

    // Set up URL link
    const urlLink = document.getElementById("detail-url");
    if (snippet.url) {
      urlLink.href = snippet.url;
      urlLink.textContent = "View Source";
    } else {
      urlLink.href = "#";
      urlLink.textContent = "No URL";
    }
  }

  function showList() {
    document.getElementById("detail-view").style.display = "none";
    document.getElementById("list-view").style.display = "flex";
    currentSnippet = null;
  }

  function showEditModal(snippet) {
    const modal = document.getElementById("edit-modal");
    document.getElementById("edit-id").value = snippet.id;
    document.getElementById("edit-grade").value = snippet.grade || "";
    document.getElementById("edit-subject").value = snippet.subject || "";
    document.getElementById("edit-unit").value = snippet.unit || "";
    document.getElementById("edit-page").value = snippet.page || "";
    document.getElementById("edit-question-type").value =
      snippet.questionTypeRequest || "";
    document.getElementById("edit-file-name").value = snippet.file_name || "";
    document.getElementById("edit-text").value = snippet.raw_text || "";
    modal.style.display = "flex";
  }

  function hideEditModal() {
    document.getElementById("edit-modal").style.display = "none";
  }

  function deleteSnippet(snippetId) {
    if (confirm("Are you sure you want to delete this snippet?")) {
      chrome.runtime.sendMessage(
        { action: "delete-snippet", id: snippetId },
        (response) => {
          if (response.success) {
            // Go back to list view and reload
            showList();
            loadSnippets();
          } else {
            alert("Failed to delete snippet");
          }
        }
      );
    }
  }

  // Event listeners
  document.getElementById("close-overlay").onclick = () => overlay.remove();

  document.getElementById("apply-filters").onclick = () => {
    filters = {
      subject: document.getElementById("filter-subject").value,
      grade: document.getElementById("filter-grade").value,
      page: document.getElementById("filter-page").value
        ? parseInt(document.getElementById("filter-page").value)
        : null,
      exported: document.getElementById("filter-exported").value || null,
    };
    currentPage = 1;
    loadSnippets();
  };

  document.getElementById("clear-filters").onclick = () => {
    document.getElementById("filter-subject").value = "";
    document.getElementById("filter-grade").value = "";
    document.getElementById("filter-page").value = "";
    document.getElementById("filter-exported").value = "";
    filters = {};
    currentPage = 1;
    loadSnippets();
  };

  document.getElementById("prev-page").onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadSnippets();
    }
  };

  document.getElementById("next-page").onclick = () => {
    currentPage++;
    loadSnippets();
  };

  // Detail view navigation
  document.getElementById("back-to-list").onclick = showList;

  // Detail view actions
  document.getElementById("edit-snippet").onclick = () => {
    if (currentSnippet) {
      const snippet = allSnippets.find((s) => s.id === currentSnippet);
      if (snippet) showEditModal(snippet);
    }
  };

  document.getElementById("delete-snippet").onclick = () => {
    if (currentSnippet) {
      deleteSnippet(currentSnippet);
    }
  };

  // Modal events
  document.getElementById("snippet-form").onsubmit = (e) => {
    e.preventDefault();

    const originalSnippet = allSnippets.find((s) => s.id === currentSnippet);
    if (!originalSnippet) {
      alert("Snippet not found!");
      return;
    }
    const snippetData = {
      ...originalSnippet,
      id: document.getElementById("edit-id").value,
      grade: document.getElementById("edit-grade").value,
      subject: document.getElementById("edit-subject").value,
      unit: document.getElementById("edit-unit").value,
      page: document.getElementById("edit-page").value,
      questionTypeRequest: document.getElementById("edit-question-type").value,
      file_name: document.getElementById("edit-file-name").value,
      raw_text: document.getElementById("edit-text").value,
    };

    chrome.runtime.sendMessage(
      { action: "update-snippet", snippet: snippetData },
      (response) => {
        if (response.success) {
          hideEditModal();
          loadSnippets();
          // Refresh detail view if we're viewing this snippet
          if (currentSnippet === snippetData.id) {
            const updatedSnippet = allSnippets.find(
              (s) => s.id === snippetData.id
            );
            if (updatedSnippet) showSnippetDetail(updatedSnippet);
          }
        } else {
          alert("Failed to update snippet");
        }
      }
    );
  };

  document.getElementById("cancel-edit").onclick = hideEditModal;
  document.querySelector(".close-modal").onclick = hideEditModal;

  // Close modal when clicking outside
  document.getElementById("edit-modal").onclick = (e) => {
    if (e.target.id === "edit-modal") hideEditModal();
  };

  loadSnippets();
})();
