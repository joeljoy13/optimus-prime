import { app, BrowserWindow, clipboard, dialog, ipcMain } from 'electron';
import { writeFile } from 'fs/promises';
import path from 'path';
import { PrimeOrbitService } from '../src/engine/service';
import type { EncodingType, SaveSessionPayload, TransformType } from '../src/engine/types';

const service = new PrimeOrbitService();

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1020,
    minHeight: 760,
    title: 'Prime Orbit',
    backgroundColor: '#070c14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void win.loadURL(devUrl);
  } else {
    void win.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
  }
};

app.whenReady().then(() => {
  ipcMain.handle('prime-orbit:get-state', () => service.getSnapshot());

  ipcMain.handle('prime-orbit:set-max-index', (_event, value: number) => service.setMaxIndex(value));

  ipcMain.handle('prime-orbit:set-prime-state', (_event, primeInput: string) =>
    service.setPrimeState(primeInput)
  );

  ipcMain.handle('prime-orbit:transform', (_event, transform: TransformType) =>
    service.transform(transform)
  );

  ipcMain.handle('prime-orbit:encode-current', (_event, encoding: EncodingType) =>
    service.encodeCurrent(encoding)
  );

  ipcMain.handle('prime-orbit:copy', (_event, text: string) => {
    clipboard.writeText(text);
    return true;
  });

  ipcMain.handle('prime-orbit:reset', () => service.reset());

  ipcMain.handle('prime-orbit:save-session', async (_event, payload: SaveSessionPayload) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Prime Orbit Session',
      defaultPath: `prime-orbit-session-${Date.now()}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (canceled || !filePath) {
      return { saved: false };
    }

    await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return { saved: true, path: filePath };
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
