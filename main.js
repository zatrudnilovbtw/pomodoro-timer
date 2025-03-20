import { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } from 'electron';
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
let tray;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "dist", "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.removeMenu();

  const isDev = process.env.NODE_ENV === "development" || process.argv.includes("--dev");
  const indexPath = path.join(__dirname, "dist", "index.html");
  console.log("Загружаемый путь:", indexPath); // Для отладки
  win.loadURL(
    isDev
      ? "http://localhost:5173"
      : `file://${indexPath}`
  );

  win.on('minimize', () => {
    // Окно сворачивается в панель задач
  });

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  const iconPath = path.join(__dirname, "dist", "icon.png");
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Показать', click: () => { win.show(); win.restore(); } },
    { label: 'Выход', click: () => app.quit() },
  ]);
  tray.setToolTip('Pomodoro Timer Desktop');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    win.show();
    win.restore();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("send-notification", async (event, title, body) => {
  try {
    new Notification({ title, body }).show();
  } catch (error) {
    console.error("Ошибка отправки уведомления:", error);
  }
});