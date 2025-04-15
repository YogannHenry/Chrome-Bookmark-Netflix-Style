
// Function to recursively extract bookmarks
function extractBookmarks(bookmarkNodes, allBookmarks = []) {
  for (const node of bookmarkNodes) {
    if (node.url) {
      allBookmarks.push({ title: node.title, url: node.url });
    }
    if (node.children) {
      extractBookmarks(node.children, allBookmarks);
    }
  }
  return allBookmarks;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getBookmarks") {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const bookmarks = extractBookmarks(bookmarkTreeNodes);
      sendResponse({ bookmarks: bookmarks });
    });
    return true; // Required for asynchronous response
  }
});

console.log("Bookmarks extension background script loaded");