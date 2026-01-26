# AGENTS.md

Guidelines for AI coding agents working in this Zotero plugin repository.

## Project Overview

A Zotero plugin (Firefox extension) that imports folders of attachments into collection hierarchies. Built with TypeScript, compiled to Firefox-compatible JavaScript (IIFE), packaged as XPI.

**Key constraint**: Runs in Zotero/Firefox 60 runtime, NOT Node.js. No Node.js APIs available.

## Commands

### Build & Development
```bash
npm run lint      # Format + check TypeScript (dprint)
npm run build     # Full build: lint → tsc --noEmit → esbuild → XPI package
npm run start     # Build + launch Zotero with plugin installed
npm run release   # Create release build
```

### Testing
**No automated test suite.** Manual testing only via:
```bash
npm run start     # Launches Zotero with the plugin for testing
```

### Single File Operations
```bash
# Format single file
npx dprint fmt content/folder-import.ts

# Type check (whole project only)
npx tsc --noEmit
```

## Code Style

### Formatter: dprint
Configuration in `dprint.json`. Key rules:

| Rule | Setting |
|------|---------|
| Quotes | Single (`'`) |
| Semicolons | ASI (no semicolons) |
| Trailing commas | Only multiline |
| Braces | Same line |
| Arrow parens | Omit for single param |
| Line width | 1024 (no forced wrapping) |
| Tabs | Spaces (2) |

### TypeScript Settings
- Target: ES2017
- Module: CommonJS
- `noImplicitAny: false` (implicit any allowed)
- `noUnusedLocals: true`
- `skipLibCheck: true`

### Import Style
```typescript
// External packages first
import { FilePickerHelper, ZoteroToolkit } from 'zotero-plugin-toolkit'

// Internal modules
import { log } from './debug'
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `FolderScanner`, `$FolderImport` |
| Functions | camelCase | `addAttachmentsFromFolder` |
| Variables | camelCase | `chromeHandle`, `libraryID` |
| Constants | camelCase | `html` (for namespace URIs) |
| Private members | No prefix | `private status` |
| Exported singletons | PascalCase | `export var FolderImport = ...` |

### Global Declarations
Zotero/Firefox globals must be declared before use:
```typescript
declare var Zotero: any
declare const Services: any
declare const Components: any
declare const ChromeUtils: any
declare const FileUtils: any
```

### Class Patterns
```typescript
class FolderScanner {
  files: string[] = []           // Public property with initializer
  private status: { ... }        // Private property

  constructor(public path: string, isRoot: boolean) {  // Parameter properties
    // ...
  }

  public async scan() { ... }    // Explicit public modifier
  private extension(path: string): false | string { ... }  // Explicit private
}
```

### Async/Await Patterns
```typescript
// Always use async/await, not raw Promises
public async startup() {
  await Zotero.initializationPromise
  // ...
}

// Sleep helper pattern used for Zotero timing
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
await sleep(10)  // Brief delay for Zotero operations
```

### Error Handling
```typescript
try {
  // operation
}
catch (err) {
  log.error(err)  // Use logger, don't rethrow unless needed
}
```

### Logging
Use the centralized logger from `./debug`:
```typescript
import { log } from './debug'

log.info('message')    // Info-level
log.debug('message')   // Debug-level
log.error(err)         // Errors
```

## Architecture

### Plugin Lifecycle
```
bootstrap.ts (entry)
  ├── install() / uninstall()
  ├── startup() / shutdown()
  └── onMainWindowLoad() / onMainWindowUnload()
```

### Key Files
| File | Purpose |
|------|---------|
| `bootstrap.ts` | Plugin lifecycle, chrome registration |
| `content/folder-import.ts` | Core logic: FolderScanner, $FolderImport |
| `content/bulkimport.ts` | Bulk import UI handlers |
| `content/debug.ts` | Logger setup |
| `content/globals.d.ts` | Type augmentations for Zotero namespace |
| `content/*.xul` | XUL dialog definitions |
| `content/wizard.pug` | Pug template → compiled to wizard.xhtml |

### Build Pipeline
1. dprint formats TypeScript
2. tsc --noEmit (type checking only)
3. esbuild bundles to IIFE format (Firefox 60 target)
4. pug compiles to XHTML
5. zotero-plugin-zipup creates XPI

### Zotero Integration
- `Zotero` global object is the main API
- `Services` provides Firefox services (prompt, io, etc.)
- `Components` accesses XPCOM components
- `IOUtils`, `PathUtils` for file operations (NOT Node.js fs)

## Important Constraints

1. **Firefox 60 Compatibility**: No modern JS features unavailable in Firefox 60
2. **No Node.js**: Code runs in Zotero's Firefox runtime
3. **XUL UI**: Dialogs use XUL (Firefox's XML UI language)
4. **Global Zotero**: Plugin exposes `Zotero.FolderImport` singleton
5. **Async Timing**: Brief `sleep()` calls needed after Zotero mutations

## Common Patterns

### Registering Menu Items
```typescript
ztoolkit.Menu.register('menuFile', {
  tag: 'menuitem',
  label: 'Add Files from Folder…',
  oncommand: 'Zotero.FolderImport.addAttachmentsFromFolder()',
})
```

### File Operations
```typescript
// Directory iteration
for (const entry of (await IOUtils.getChildren(this.path))) {
  const info = await IOUtils.stat(entry)
  if (info.type === 'directory') { ... }
}

// Path operations
const name = PathUtils.filename(path)
const joined = PathUtils.join(dir, filename)
```

### Zotero Collections/Items
```typescript
const collection = zoteroPane.getSelectedCollection()
await collection.loadAllData()
const item = await Zotero.Attachments.importFromFile({
  file,
  libraryID: params.libraryID,
  collections: [collection.id],
})
```

## Verification Checklist

Before submitting changes:
- [ ] `npm run lint` passes (auto-formats + checks)
- [ ] `npm run build` succeeds (full build)
- [ ] `npm run start` works (manual test in Zotero)
- [ ] No TypeScript errors from `tsc --noEmit`
