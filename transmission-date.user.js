// ==UserScript==
// @name         Transmission date
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Change the added date column to the days since it has been added instead of the date. Color code the column for the amount of days it was there
// @author       Codeplex
// @match        http://192.168.2.32:9091/transmission/web/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=2.32
// @grant        none
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

const redThreshold = 8;     // Mark as red if added less than these days
const orangeThreshold = 14; // Mark as orange if added less than these days

// Observe the table for mutations
const observer = new MutationObserver((mutations, observer) => {
    observer.disconnect();
    initTable();
});

// Initialize the table and observe for changes
function initTable() {
    const table = document.querySelector("body > main > div.content.svelte-1duie5y > div > table");
    if (!table) return;

    calculateDays();
    observer.observe(table, { attributes: false, childList: true, subtree: true });
}

// Calculate days since torrents were added and update the table
function calculateDays() {
    const headers = Array.from(document.querySelectorAll("body > main > div.content.svelte-1duie5y > div > table > thead > th"));
    const indexOfAddedColumn = headers.findIndex(header => header.innerText === 'Added');

    if (indexOfAddedColumn === -1) {
        alert("Unable to find 'Added' column\nMake sure it has been added");
        return;
    }

    const rows = document.querySelectorAll("body > main > div.content.svelte-1duie5y > div > table > tbody > tr");

    rows.forEach(row => {
        const cell = row.querySelector(`td:nth-child(${indexOfAddedColumn + 1})`);
        const date = cell.getAttribute("date") || cell.textContent;
        if (date) {
            setDaysInCell(date, cell);
        }
    });
}

// Set the number of days in the cell and apply color coding
function setDaysInCell(date, cell) {
    const addedDate = parseDate(date);
    const dayDiff = calculateDayDifference(addedDate);

    cell.innerHTML = dayDiff;
    applyColorCoding(cell, dayDiff);
    cell.setAttribute("date", date);
}

// Parse the date in YYYY-MM-DD format
function parseDate(date) {
    const [year, month, day] = date.split(" ")[0].split("-");
    return new Date(year, month - 1, day);
}

// Calculate the difference in days between the current date and the added date
function calculateDayDifference(addedDate) {
    const diff = new Date() - addedDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) - 1;
}

// Apply color coding based on the number of days
function applyColorCoding(cell, dayDiff) {
    if (dayDiff < redThreshold) {
        cell.style.backgroundColor = 'red';
        cell.style.color = 'white';
    } else if (dayDiff < orangeThreshold) {
        cell.style.backgroundColor = 'orange';
        cell.style.color = 'white';
    } else {
        cell.style.backgroundColor = 'green';
        cell.style.color = 'white';
    }
}

// Wait for the table element and initialize the script
waitForKeyElements(".svelte-12s0e7b > tbody", () => setTimeout(initTable, 500), true);
