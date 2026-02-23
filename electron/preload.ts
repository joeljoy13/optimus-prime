import { contextBridge, ipcRenderer } from 'electron';
import type { EncodingType, SaveSessionPayload, TransformType } from '../src/engine/types';

const api = {
  getState: () => ipcRenderer.invoke('prime-orbit:get-state'),
  setMaxIndex: (value: number) => ipcRenderer.invoke('prime-orbit:set-max-index', value),
  transform: (transform: TransformType) => ipcRenderer.invoke('prime-orbit:transform', transform),
  encodeCurrent: (encoding: EncodingType) => ipcRenderer.invoke('prime-orbit:encode-current', encoding),
  copy: (text: string) => ipcRenderer.invoke('prime-orbit:copy', text),
  reset: () => ipcRenderer.invoke('prime-orbit:reset'),
  saveSession: (payload: SaveSessionPayload) => ipcRenderer.invoke('prime-orbit:save-session', payload)
};

contextBridge.exposeInMainWorld('primeOrbit', api);
