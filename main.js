// Import Electron modules and Node.js path utility
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Function to create the desktop browser window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1050,
    height: 800,
    minWidth: 850,
    minHeight: 650,
    webPreferences: {
      nodeIntegration: true,   // Allows Node.js APIs in renderer
      contextIsolation: false  // Enables direct communication
    }
  });

  // Load the initial dashboard interface
  mainWindow.loadFile('index.html');
}

// Launch application window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // Re-create window on macOS when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Terminate application when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});