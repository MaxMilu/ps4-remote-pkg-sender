# 🎮 PS4 Remote PKG Sender v2

> A desktop tool for sending and installing PKG files on PS4 / PS5. This fork adds dedicated support for PS5 `singleDPI`.

🌐 **Language**: [简体中文 / Chinese](README.md) · English (current page)

📚 [View the original upstream README](https://github.com/Gkiokan/ps4-remote-pkg-sender#readme)

## 🧩 Fork features

This fork focuses on using the PS4 Remote PKG Sender with the PS5 `singleDPI` package installer while retaining the existing PS4 and PS5 etaHEN workflows.

- **PS5 `singleDPI` target** using the TCP 9090 API
- **DPI v1 / v2 compatibility** for singleDPI installation workflows
- Multilingual interface with Simplified Chinese, German and other available translations
- Optional **Skip Installed** queue handling
- Configurable delay between queued installations
- PKG title, Content ID, icon, download, install and Promote progress display
- SFO-based detection for Base, Patch and DLC installation records
- Improved Processing Center and Server tables with title, version, category, Content ID, remaining time and transfer speed
- Automatic table height adjustment for long queues
- Separate reset actions for installed, completed and queued entries
- Windows x64 build command for the legacy dependency chain

## 🆕 Version 2.10.5 fixes

Version 2.10.5 addresses a PS5 high-firmware HTTP installation compatibility issue that could result in:

```text
0x80B2116F (SCE_PLAYGO_ERROR_CORE_INVALID_SLOT)
```

### ✅ Fixes

- Fixed PS5 13.60 rejecting HTTP-served PKGs when the `Last-Modified` response value changed during installation
- Kept the HTTP representation of the same PKG stable across repeated and range requests
- Improved compatibility with both singleDPI DPI v1 and DPI v2 workflows
- Preserved the existing PS4, PS5, etaHEN and singleDPI installation modes
- Updated the application version to `2.10.5`
- Added Windows x64 ZIP and Portable release builds

### ⚠️ Usage notes

- Load a firmware-compatible `kstuff` or `kstuff-lite` on the PS5 before loading `singleDPI.elf`
- Select **PS5 singleDPI** as the target in the Sender
- PS5 13.60 users should use **PS4 Remote PKG Sender 2.10.5 or newer**
- If `0x80B2116F` still occurs, verify that the new Sender is being used and test whether the PKG installs through **Debug Settings → Package Installer**

The 2.10.5 fix is in the PKG HTTP response layer. The singleDPI installation call itself was not changed.

## 🚀 Build on Windows

The current release target is Windows x64. Other platforms can be built from source when the required legacy build environment is available.

```powershell
npm install
npm run build:win:x64
```

The build output is written to the `release` directory.

## 🔧 singleDPI setup

1. Load a `kstuff` / `kstuff-lite` payload matching the PS5 system firmware.
2. Load `singleDPI.elf`.
3. Start PS4 Remote PKG Sender 2.10.5 or newer.
4. Select **PS5 singleDPI** in the application configuration.
5. Add the PKG file to the queue and start the installation.

## 📖 Original project documentation

For the upstream feature list, PS4 instructions, troubleshooting guide, credits and disclaimer, see the [original PS4 Remote PKG Sender README](https://github.com/Gkiokan/ps4-remote-pkg-sender#readme).

