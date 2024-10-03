import { BaseDirectory, copyFile, create, exists, FileHandle, lstat, mkdir, open, readDir, readFile, readTextFile, readTextFileLines, remove, rename, SeekMode, stat, truncate, watch, watchImmediate, writeFile, writeTextFile } from '@tauri-apps/plugin-fs'

export function useTauriFS() {
  return {
    BaseDirectory,
    FileHandle,
    create,
    open,
    copyFile,
    mkdir,
    readDir,
    readFile,
    readTextFile,
    readTextFileLines,
    remove,
    rename,
    SeekMode,
    stat,
    lstat,
    truncate,
    writeFile,
    writeTextFile,
    exists,
    watch,
    watchImmediate,
  }
}
