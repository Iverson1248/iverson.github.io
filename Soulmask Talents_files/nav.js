var userNavData;

function onNavLoad() {
    let navData = loadUserNavData();

    const elements = document.getElementsByClassName("nav-category");
    for (const element of elements) {
        const items = getNavItems(element);
        for (const item of items) {
            const links = item.getElementsByTagName("a");
            for (const link of links) {
                if (window.location.href.includes(link.getAttribute("href").split('?')[0])) {
                    navData[element.id] = 1;
                    break;
                }
            }
        }
    }

    userNavData = {};
    applyUserNavData(navData, userNavData);
    saveUserNavData();
}

function toggleNavHeader(element) {
    const items = getNavItems(element);
    const expanded = items.length > 0 && items[0].style.display == "block" ? 0 : 1;
    userNavData[element.id] = expanded;
    for (const item of items) {
        item.style.display = expanded === 1 ? 'block' : '';
    }
    saveUserNavData();
}

function getNavItems(element) {
    let items = [];
    for (const child of element.parentElement.children) {
        if (child.nodeName == "UL" || child.nodeName == "OL") {
            items.push(child);
        }
    }
    return items;
}

function createUserNavData() {
    let data = {};

    const elements = document.getElementsByClassName("nav-category");
    for (const element of elements) {
        const items = getNavItems(element);
        data[element.id] = items.length > 0 && items[0].style.display == "block" ? 1 : 0;
    }

    return data;
}

function loadUserNavData() {
    let userData = createUserNavData();
    if (localStorage.hasOwnProperty("nav")) {
        try
        {
            let storedData = JSON.parse(localStorage["nav"]);
            if (storedData) {
                applyUserNavData(storedData, userData);
            }
        }
        catch
        {
            return createUserNavData();
        }
    }

    return userData;
}

function saveUserNavData() {
    localStorage.setItem("nav", JSON.stringify(userNavData));
}

function applyUserNavData(inData, outData) {
    for (const key of Object.keys(inData)) {
        const element = document.getElementById(key);
        if (element) {
            const expanded = inData[key];
            outData[key] = expanded;
            const items = getNavItems(element);
            for (const item of items) {
                item.style.display = expanded === 1 ? 'block' : '';
            }
        }
    }
}

function onVisibilityChange() {
    if (document.visibilityState == "visible") {
        onNavLoad();
    }
}

window.addEventListener('DOMContentLoaded', onNavLoad);
document.addEventListener("resume", onNavLoad);
