chrome.commands.onCommand.addListener(async (command) => {
  if (command === "capture-text") {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tabs || tabs.length === 0) return;
      const tab = tabs[0];

      // Inject overlay script into the active tab
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["overlay.js"],
      });
    } catch (err) {
      console.error("Error injecting overlay:", err);
    }
  }
  if (command === "view-snippets") {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tabs || tabs.length === 0) return;
      const tab = tabs[0];

      // Inject overlay script into the active tab
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["view-snippets.js"],
      });
    } catch (err) {
      console.error("Error injecting snippets viewer:", err);
    }
  }
});

// Message handler: save snippet, export snippets
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return;
  if (msg.action === "update-snippet") {
    const payload = msg.snippet;
    chrome.storage.local.get({ snippets: [] }, async ({ snippets }) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }
      const akd = snippets.filter((sn) => sn.id !== payload.id);
      akd.push(payload);
      chrome.storage.local.set({ snippets: akd }, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          sendResponse({ success: true });
        }
      });
    });
    return true;
  }

  if (msg.action === "delete-snippet") {
    const snippetId = msg.id;
    chrome.storage.local.get({ snippets: [] }, ({ snippets }) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }

      const updatedSnippets = snippets.filter((sn) => sn.id !== snippetId);

      chrome.storage.local.set({ snippets: updatedSnippets }, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          sendResponse({ success: true });
        }
      });
    });
    return true;
  }
  if (msg.action === "view-snippets") {
    chrome.storage.local.get({ snippets: [] }, async ({ snippets }) => {
      let filters = msg.filters || {}; //{exported :boolean,page:number,subject:string,grade:"NINE"|"TEN"|"ELEVEN"|"TWElVE"}

      if (!filters.exported) filters.exported = false;
      else
        filters.exported =
          filters.exported === "" ? undefined : filters.exported === "true";

      let filteredSnippets = snippets.filter((sn) => {
        let match = true;
        if (filters.subject) match = match && sn.subject === filters.subject;
        if (filters.grade) match = match && sn.grade === filters.grade;
        if (filters.page) match = match && sn.page === Number(filters.page);
        if (filters.exported !== undefined && filters.exported !== null)
          match = match && sn.exported === filters.exported;
        return match;
      });

      const pageSize = 10;
      let currentPage = msg.page || 1;
      const totalItems = snippets.length;
      const totalFilteredItems = filteredSnippets.length;
      const totalPages = Math.ceil(totalItems / pageSize);

      const slicedSnippets = filteredSnippets.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

      sendResponse({
        snippets: slicedSnippets,
        pagination: { currentPage, totalItems, totalPages, totalFilteredItems },
      });
    });
    return true;
  }
  if (msg.action === "save-snippet") {
    const payload = msg.payload || {};
    // add timestamp server-side to ensure consistency
    payload.savedAt = new Date().toISOString();

    chrome.storage.local.get({ snippets: [] }, ({ snippets }) => {
      snippets.push(payload);
      chrome.storage.local.set({ snippets }, () => {
        sendResponse({
          ok: true,
          total: snippets.filter((s) => !s.exported).length,
          exported: snippets.filter((s) => s.exported).length,
        });
      });
    });
    // indicate async response
    return true;
  }

  function chunkArray(arr, size = 15) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  if (msg.action === "export-snippets") {
    chrome.storage.local.get({ snippets: [] }, async ({ snippets }) => {
      try {
        // Filter only unexported snippets
        const snippetsToExport = snippets
          .filter((s) => !s.exported)
          .sort((a, b) => {
            const subjectCompare = a.subject.localeCompare(b.subject);
            if (subjectCompare !== 0) return subjectCompare;
            const gradeCompare = a.grade - b.grade;
            if (gradeCompare !== 0) return gradeCompare;
            return a.page - b.page;
          });

        if (snippetsToExport.length === 0) {
          sendResponse({
            ok: true,
            exported: 0,
            message: "No new snippets to export.",
          });
          return;
        }
        const chunks = chunkArray(snippetsToExport);
        for (const chunk of chunks) {
          const json = JSON.stringify(chunk, null, 2);
          const dataUrl =
            "data:application/json;charset=utf-8," + encodeURIComponent(json);
          // const filename = `clipboard-snippets-${new Date().toISOString().slice(0,10)}.json`;
          const filename = `pdf-hotkey/snippets/questions.json`;

          // Download the file
          await new Promise((resolve, reject) => {
            chrome.downloads.download(
              {
                url: dataUrl,
                filename: filename,
                saveAs: true,
              },
              (downloadId) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(downloadId);
                }
              }
            );
          });
        }
        // Update exported flags to true
        const updatedSnippets = snippets.map((snippet) => {
          if (!snippet.exported) {
            return { ...snippet, exported: true };
          }
          return snippet;
        });
        // Save updated snippets back to storage
        await new Promise((resolve) => {
          chrome.storage.local.set({ snippets: updatedSnippets }, resolve);
        });

        sendResponse({
          ok: true,
          exported: snippetsToExport.length,
          totalExported: updatedSnippets.filter((s) => s.exported).length,
        });
      } catch (error) {
        sendResponse({
          ok: false,
          error: error.message,
        });
      }
    });
    return true;
  }

  if (msg.action === "clear-snippets") {
    chrome.storage.local.set({ snippets: [] }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
