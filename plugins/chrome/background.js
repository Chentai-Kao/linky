const pattern = new RegExp('^https?://([^{}.]+)/$');

chrome.webNavigation.onBeforeNavigate.addListener(router);

async function router(info) {
  const { url, tabId } = info;
  if (url) {
    const found = url.match(pattern);
    if (found) {
      chrome.storage.sync.get(['magicKey'], async (data) => {
        const { host, email, key } = JSON.parse(atob(data.magicKey));
        const query = found[1].endsWith('/') ? found[1].slice(0, -1) : found[1];
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`${host}/redirect?email=${email}&key=${key}&query=${encodedQuery}`)
        if (response.ok) {
          const { redirectUrl } = await response.json();
          if (redirectUrl) {
            chrome.tabs.update(tabId, { url: redirectUrl });
          }
        }
      });
    }
  }
}
