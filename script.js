// Function to generate a UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let dirHandle;

async function selectFolder() {
    const results = document.getElementById('results');
    results.innerHTML = '';

    try {
        // Show directory picker to select the folder
        dirHandle = await window.showDirectoryPicker();

        // Enable the Start button
        document.getElementById('startButton').disabled = false;

        // Display folder path (if available)
        const folderPath = dirHandle.name; // For most browsers, only the folder name is accessible
        results.innerHTML = `Folder selected: <b>${folderPath}</b>.<br>Now click "Start" to rename files.`;
    } catch (err) {
        console.error(err);
        results.innerHTML = 'Error selecting folder. Please try again.';
    }
}

async function renameFiles() {
    const results = document.getElementById('results');
    results.innerHTML = '';

    if (!dirHandle) {
        alert('Please select a folder first.');
        return;
    }

    let renamedFiles = 0;

    // Create table and headers
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const originalHeader = document.createElement('th');
    const newHeader = document.createElement('th');
    originalHeader.textContent = 'Original';
    newHeader.textContent = 'New';
    headerRow.appendChild(originalHeader);
    headerRow.appendChild(newHeader);
    table.appendChild(headerRow);

    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            const extension = entry.name.split('.').pop();
            const newName = generateUUID() + '.' + extension;

            // Create a new file handle with the new name
            const newHandle = await dirHandle.getFileHandle(newName, { create: true });
            const writable = await newHandle.createWritable();
            const file = await entry.getFile();
            await writable.write(file);
            await writable.close();
            await entry.remove();

            const row = document.createElement('tr');
            const originalCell = document.createElement('td');
            const newCell = document.createElement('td');
            originalCell.textContent = entry.name;
            newCell.textContent = newHandle.name;
            row.appendChild(originalCell);
            row.appendChild(newCell);
            table.appendChild(row);
            renamedFiles++;
        }
    }

    results.appendChild(table);
    alert(`All file names have been changed. Total renamed: ${renamedFiles}`);
}
