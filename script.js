document.addEventListener("DOMContentLoaded", function () { 
    const bookmarkList = document.getElementById("bookmarkList");
    bookmarkList.classList.add("horizontal-list"); // Ensure the main list is horizontal

    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        if (chrome.runtime.lastError) {
            console.error("Error fetching bookmarks:", chrome.runtime.lastError);
            return;
        }

        let rootNodes = bookmarkTreeNodes[0].children; // Get the main folders (Bookmarks Bar, Other Bookmarks, Mobile)
        let otherBookmarksNode = null;
        let processedNodes = [];

        rootNodes.forEach((node) => {
            if (node.title === "Bookmarks") {
                // Don't create a folder, just append its children directly
                processedNodes.push(...node.children);
            } else if (node.title === "Other Bookmarks") {
                // Store "Other Bookmarks" separately to add later
                otherBookmarksNode = node;
            } else {
                // Keep other folders and bookmarks as they are
                processedNodes.push(node);
            }
        });

        // Render all normal bookmarks and folders first
        displayBookmarks(processedNodes, bookmarkList);

        // Render "Other Bookmarks" at the end
        if (otherBookmarksNode) {
            displayBookmarks([otherBookmarksNode], bookmarkList);
        }
    });

    function displayBookmarks(nodes, parentElement) {
        nodes.forEach((node) => {
            if (node.children) {
                // Create Folder Element
                const folder = document.createElement("li");
                folder.classList.add("folder");

                const arrow = document.createElement("span");
                arrow.textContent = "▶"; // Right arrow initially
                arrow.style.cursor = "pointer";
                arrow.style.marginRight = "5px";
                arrow.style.userSelect = "none"; // Prevent selection

                const folderName = document.createElement("span");
                folderName.textContent = node.title;
                folderName.style.cursor = "pointer";

                folder.appendChild(arrow);
                folder.appendChild(folderName);
                parentElement.appendChild(folder);

                // Inline nested bookmarks
                const sublist = document.createElement("ul");
                sublist.classList.add("nested");
                sublist.style.display = "none"; // Initially hidden
                folder.appendChild(sublist);
                
                // Toggle folder visibility on click (inline expansion)
                folderName.addEventListener("click", () => {
                    const isVisible = sublist.style.display === "flex";
                    sublist.style.display = isVisible ? "none" : "flex";
                    arrow.textContent = isVisible ? "▶" : "▼"; // Change arrow
                });

                arrow.addEventListener("click", () => {
                    const isVisible = sublist.style.display === "flex";
                    sublist.style.display = isVisible ? "none" : "flex";
                    arrow.textContent = isVisible ? "▶" : "▼";
                });

                displayBookmarks(node.children, sublist);
            } else {
                // Create Bookmark Element
                const bookmark = document.createElement("li");
                bookmark.classList.add("bookmark");

                const favicon = document.createElement("img");
                const url = new URL(node.url);
                // Manifest v3 Favicon fetching
                favicon.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
                favicon.style.width = "15px";
                favicon.style.height = "15px";
                favicon.alt = "";
                favicon.style.marginRight = "8px";

                const link = document.createElement("a");
                link.href = node.url;
                link.textContent = node.title || "Unnamed Bookmark";

                bookmark.appendChild(favicon);
                bookmark.appendChild(link);
                parentElement.appendChild(bookmark);
            }
        });
    }


    const list = document.getElementById('list');
    var quotes_list = [];

    chrome.storage.sync.get(/* String or Array */["list"], function(items){
        console.log(items['list']);
        if (items['list'] == '' || items['list'] == null) {
            quotes = ['Edit List to See Quotes'];
        } else {
            quotes = items['list'].split('^');
        }
        quotes_list = items['list'];
        document.getElementById('quote').innerText = quotes[Math.floor(((Math.random() + Date.now()) % 1.0) * quotes.length)];
    });

    var edit_button = document.getElementById("edit-list");

    edit_button.onclick = function() {
        if (list.offsetParent == null) {
            list.style.display = 'inline-block';
            list.value = quotes_list;
            edit_button.innerHTML = "Save Quotes";
        } else {
            list.style.display = 'none';
            edit_button.innerHTML = "Edit Quotes";
            chrome.storage.sync.set({ "list": list.value }, function(){});
            quotes = list.value.split('^');
            document.getElementById('quote').innerText = quotes[Math.floor(((Math.random() + Date.now()) % 1.0) * quotes.length)];
        }
    };

    const edit_bookmark_button = document.getElementById('edit-bookmarks');
    edit_bookmark_button.addEventListener("click", function () {
        chrome.tabs.create({ url: "chrome://bookmarks/" });
    });


    chrome.storage.sync.get(/* String or Array */["light"], function(item){
        console.log(item);
        if (item['light'] != true) {
            var element = document.body;
            element.classList.toggle("dark-mode");
        }
    });

    document.getElementById('toggle-theme').onclick = function() {
        var element = document.body;
        element.classList.toggle("dark-mode");
        console.log(element.classList.value == '');
        chrome.storage.sync.set({ "light": element.classList.value == '' }, function(){});
        chrome.storage.sync.get(/* String or Array */["light"], function(item){console.log(item)});
    };
});
