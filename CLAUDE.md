# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zotero plugin (extension) that enables importing folders of attachments into a collection hierarchy. It's built with TypeScript and uses the Zotero plugin framework.

## Essential Commands

### Development
- `npm run lint` - Format and check TypeScript code (uses dprint)
- `npm run build` - Full build process (lint → compile → bundle → package)
- `npm run start` - Build and launch Zotero with the plugin installed
- `npm run release` - Create a release build

### Testing
- `npm run start` - Launches Zotero with the plugin for manual testing
- No automated test suite is configured

## Architecture

### Plugin Structure
The plugin follows Zotero's extension architecture:
- **bootstrap.ts**: Entry point managing plugin lifecycle (install/startup/shutdown)
- **content/folder-import.ts**: Core functionality - folder scanning and import logic
- **content/bulkimport.ts**: Bulk import operations
- **content/wizard.pug**: Import wizard UI (compiled to HTML)

### Key Classes
- **FolderScanner**: Recursively scans directories for files and builds hierarchy
- **Zotero.FolderImport**: Main plugin object exposed to Zotero

### Build System
- **esbuild**: Bundles TypeScript into Firefox-compatible JavaScript (IIFE format)
- **TypeScript**: Target ES2017, CommonJS modules
- **zotero-plugin-toolkit**: Provides utilities for Zotero integration
- **XPI packaging**: Creates installable Zotero extension package

### Zotero Integration Points
- Chrome registration for content/locale resources
- XUL overlay integration (bulkimport.xul)
- FTL localization support
- Menu item injection into Zotero UI

## Important Notes

1. **Firefox Compatibility**: Code must be compatible with Firefox 60 (Zotero's base)
2. **Global Variables**: Zotero, Services, Components are global objects provided by Zotero
3. **File System Access**: Uses IOUtils/OS.File for file operations
4. **UI Framework**: Uses XUL for UI elements (Firefox's XML UI language)
5. **No Node.js APIs**: This runs in Firefox/Zotero, not Node.js