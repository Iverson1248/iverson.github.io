/**
 * Builds a table of contents for the current page including any headers which have an id assigned
 * @param title               The title to display above the table.
 * @param maxLevel            The maximum header level to include. Valid values are 0 through 6. 0 = link to top only. Default is 4.
 * @param firstChildOnly      Whether to use the content of the first child of each header rather than the entire header contents.
 * @param truncate            Whether to truncate and add ellipses to overflowing text
 * @param getContentCallback  If given, this function will be called to get the content of the TOC item. The source element will be passed in as a parameter.
 * @param additionalTags      Optional array of addition tag names to include as possible headers
 */
function toc(title, maxLevel= 4, firstChildOnly = false, truncate = true, getContentCallback = null, additionalTags = null) {
    let selectors = "";
    if (maxLevel > 0) selectors += "h1";
    if (maxLevel > 1) selectors += ", h2";
    if (maxLevel > 2) selectors += ", h3";
    if (maxLevel > 3) selectors += ", h4";
    if (maxLevel > 4) selectors += ", h5";
    if (maxLevel > 5) selectors += ", h6";
    if (additionalTags) {
        for (const tag of additionalTags) {
            selectors += ", " + tag;
        }
    }

    const contentBlocks = document.getElementsByClassName("page-content");

    let tocContent = "";

    if (maxLevel > 0) {
        tocContent = "<ul class=\"nav-list\">\n";
        let prev = null;
        let indented = false;
        for (const contentBlock of contentBlocks) {
            contentBlock.querySelectorAll(selectors).forEach((header) => {
                if (header.innerText && header.id && isElementVisible(header)) {
                    if (prev) {
                        if (header.tagName !== prev.tagName) {
                            if (prev.tagName.toLowerCase() === "h1") {
                                tocContent += "<li>\n    <ul>\n";
                                indented = true;
                            } else if (indented && header.tagName.toLowerCase() === "h1") {
                                tocContent += "    </ul>\n</li>\n";
                                indented = false;
                            }
                        }
                    }

                    if (indented) {
                        tocContent += "        ";
                    }

                    let itemContent;
                    if (getContentCallback) {
                        itemContent = getContentCallback(firstChildOnly ? header.firstChild : header);
                    } else {
                        itemContent = firstChildOnly ? header.firstChild.innerText : header.innerText;
                    }

                    tocContent += "<li><a href=\"#" + header.id + "\">" + itemContent + "</a></li>\n";

                    prev = header;
                }
            });
        }
        if (indented) {
            tocContent += "    </ul>\n</li>\n"
        }
        tocContent += "</ul>\n"
    }

    let tocHeader = "<p class=\"page-nav-header\"><a href=\"#\">" + title + "</a></p>\n";

    let tocContainer = document.getElementById("page_nav");
    if (tocContainer) {
        tocContainer.innerHTML = tocHeader + tocContent;
        if (truncate) updateTocLayout();
    }

    if (truncate) {
        const mediaQuery = window.matchMedia('screen and (max-width: 900px)');
        mediaQuery.addEventListener("change", (e) => updateTocLayout());
    }
}

/**
 * Returns whether an element is currently visible
 * @param element The element to check
 */
function isElementVisible(element) {
    // Implementation taken from JQuery
    return !!( element.offsetWidth || element.offsetHeight || element.getClientRects().length );
}

function updateTocLayout() {
    // Wait until the browser has updated the view in response to adding new content
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            let tocContainer = document.getElementById("page_nav");
            let items = tocContainer.getElementsByTagName("li");
            for (let i = 0; i < items.length; ++i)
            {
                let child = items[i].firstElementChild;
                if (child.offsetWidth > items[i].offsetWidth) {
                    child.setAttribute("title", child.textContent);
                    items[i].style.overflowX = "hidden";
                }
                else {
                    child.removeAttribute("title");
                    items[i].removeAttribute("style");
                }
            }
        });
    });
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/soulmask/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
