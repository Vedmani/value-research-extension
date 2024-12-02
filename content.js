function clickExportButton() {
  const exportButton = document.querySelector('#export-download-icon');
  if (exportButton) {
    const url = exportButton.href;
    const filename = `excel_export_${Date.now()}.xls`;
    
    // Instead of clicking the button, we'll just use the URL
    chrome.runtime.sendMessage({
      action: "downloadExcel",
      url: url,
      filename: filename
    }, (response) => {
      if (response.success) {
        console.log(`Download initiated: ${filename}`);
      } else {
        console.error(`Download failed: ${response.error}`);
      }
    });
    
    return { success: true, message: "Download initiated" };
  }
  return { success: false, message: "Export button not found" };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerDownload") {
    const result = clickExportButton();
    sendResponse(result);
  }
});
