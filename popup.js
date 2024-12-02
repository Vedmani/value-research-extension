document.addEventListener('DOMContentLoaded', () => {
  const urlList = document.getElementById('urlList');
  const saveUrlsButton = document.getElementById('saveUrls');
  const startDownloadButton = document.getElementById('startDownload');
  const statusMessage = document.getElementById('statusMessage');
  const currentProgress = document.getElementById('currentProgress');
  const totalUrls = document.getElementById('totalUrls');

  // Load saved URLs
  chrome.storage.sync.get(['urls'], (result) => {
    if (result.urls) {
      urlList.value = result.urls.join('\n');
      updateTotalUrls(result.urls.length);
    }
  });

  saveUrlsButton.addEventListener('click', saveUrls);
  startDownloadButton.addEventListener('click', startDownload);

  function saveUrls() {
    const urls = urlList.value.split('\n').filter(url => url.trim() !== '');
    chrome.storage.sync.set({ urls: urls }, () => {
      statusMessage.textContent = 'URLs saved successfully!';
      updateTotalUrls(urls.length);
    });
  }

  function startDownload() {
    chrome.storage.sync.get(['urls'], (result) => {
      if (result.urls && result.urls.length > 0) {
        statusMessage.textContent = 'Starting downloads...';
        processUrls(result.urls);
      } else {
        statusMessage.textContent = 'No URLs saved. Please enter and save URLs first.';
      }
    });
  }

  function updateTotalUrls(total) {
    totalUrls.textContent = total;
  }

  function updateProgress(current) {
    currentProgress.textContent = current;
  }

  function processUrls(urls) {
    let currentIndex = 0;

    function processNextUrl() {
      if (currentIndex < urls.length) {
        const url = urls[currentIndex];
        chrome.tabs.create({ url: url, active: false }, (tab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              chrome.tabs.sendMessage(tab.id, { action: "triggerDownload" }, (response) => {
                if (response && response.success) {
                  statusMessage.textContent = `Export initiated for ${url}. Check your downloads.`;
                } else {
                  statusMessage.textContent = `Failed to find export button on ${url}`;
                }
                setTimeout(() => {
                  chrome.tabs.remove(tab.id);
                  currentIndex++;
                  updateProgress(currentIndex);
                  setTimeout(processNextUrl, 2000);
                }, 5000);
              });
            }
          });
        });
      } else {
        statusMessage.textContent = 'All export processes completed! Check your downloads.';
      }
    }

    updateProgress(0);
    processNextUrl();
  }
});
