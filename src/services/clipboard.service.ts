import process from "node:process";
import { spawn } from "node:child_process";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";

export class ClipboardService {
  private async runCommand(command: string, args: string[], input?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: ["pipe", "ignore", "ignore"] });

      if (input !== undefined) {
        child.stdin.write(input);
        child.stdin.end();
      }

      child.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  private isWayland(): boolean {
    if (process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === "wayland") return true;
    return false;
  }

  private async copyToClipboardWindows(text: string): Promise<void> {
    try {
      const args = ["-NoProfile", "-NonInteractive", "-Command", "Set-Clipboard -Value $input"];

      return await this.runCommand("powershell", args, text);
    } catch {
      return await this.runCommand("clip", [], text);
    }
  }

  private async copyToClipboardLinuxWayland(text: string): Promise<void> {
    try {
      return await this.runCommand("wl-copy", ["--trim-newline"], text);
    } catch {
      try {
        return await this.runCommand("wl-copy", ["--paste-once", "--trim-newline"], text);
      } catch {
        throw new Error("wl-copy not found. Install wl-clipboard to use the copy feature on Wayland.");
      }
    }
  }

  private async copyToClipboardLinuxX11(text: string): Promise<void> {
    try {
      return await this.runCommand("xclip", ["-selection", "clipboard"], text);
    } catch {
      try {
        return await this.runCommand("xsel", ["--clipboard", "--input"], text);
      } catch {
        throw new Error("xclip or xsel not found. Install xclip or xsel to use the copy feature on X11.");
      }
    }
  }

  private async copyToClipboardLinux(text: string): Promise<void> {
    if (this.isWayland()) {
      return await this.copyToClipboardLinuxWayland(text);
    }

    await this.copyToClipboardLinuxX11(text);
  }

  public async write(text: string): Promise<void> {
    if (typeof text !== "string") {
      throw new TypeError(`Expected a string, got ${typeof text}`);
    }

    const platform = process.platform;

    if (platform === "win32") {
      await this.copyToClipboardWindows(text);
      return;
    }

    if (platform === "linux") {
      await this.copyToClipboardLinux(text);
      return;
    }

    throw new Error(`Clipboard not supported on platform: ${platform}`);
  }
}
