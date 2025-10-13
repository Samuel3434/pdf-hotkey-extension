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
});

// Message handler: save snippet, export snippets
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return;

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

  if (msg.action === "export-snippets") {
    chrome.storage.local.get({ snippets: [] }, async ({ snippets }) => {
      try {
        // Filter only unexported snippets
        const snippetsToExport = snippets.filter((s) => !s.exported);

        if (snippetsToExport.length === 0) {
          sendResponse({
            ok: true,
            exported: 0,
            message: "No new snippets to export.",
          });
          return;
        }

        const json = JSON.stringify(snippetsToExport, null, 2);
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
