# Atomic File Structure

A simple, intelligent system that breaks files into their fundamental structural components for optimal AI context management.

## Core Concept

Break files into their **language-native structural divisions** (not application features) to make it easier for AI to work with specific parts without loading entire files.

## Universal Structure Pattern

```
src/dashboard/
├── imports.js      →
├── globals.js      →  dashboard.js (auto-merged)
├── login.js        →
├── head.html       →  dashboard.html (auto-merged)
├── body.html       →
├── variables.css   →
├── base.css        →  dashboard.css (auto-merged)
└── components.css  →
```

## Language-Specific Divisions

### JavaScript - By Declaration Type
```
src/api/
├── imports.js     → import/require statements
├── globals.js     → constants, configuration
├── auth.js        → authentication functions
├── data.js        → data processing functions
├── utils.js       → utility functions
└── exports.js     → export statements
```

### HTML - By Document Structure
```
src/pages/
├── head.html      → Everything inside <head> tag
└── body.html      → Everything inside <body> tag
```

**Example `head.html`:**
```html
<!-- START: head content -->
<title>Dashboard - MyApp</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="styles.css">
<script src="analytics.js"></script>
<!-- END: head content -->
```

**Example `body.html`:**
```html
<!-- START: body content -->
<header>
    <nav>...</nav>
</header>
<main>
    <section>...</section>
</main>
<footer>
    <p>...</p>
</footer>
<!-- END: body content -->
```

### CSS - By Cascade Hierarchy
```
src/styles/
├── imports.css     → @import statements
├── variables.css   → :root, CSS custom properties
├── base.css        → html, body, reset styles
├── layout.css      → Layout systems (.container, .grid)
├── components.css  → All component styles (.button, .card)
└── utilities.css   → Utility classes (.text-center, .hidden)
```

## Build Modes & Documentation

### Standard Build Modes
```bash
build --mode=dev        # Keep all comments, logs, docs
build --mode=prod       # Strip debug content, keep essential
build --mode=debug      # Keep everything + source maps
```

### Documentation Extraction
```bash
build --docs-only       # Extract only documentation to docs/
build --docs-consolidated  # Create single merged docs file
build --docs-extract    # Generate docs alongside normal build
```

**Documentation Output Examples:**

`build --docs-only` creates:
```
docs/
├── api/
│   ├── auth.md         → Documentation from auth.js
│   └── data.md         → Documentation from data.js
└── styles/
    └── components.md   → Documentation from components.css
```

`build --docs-consolidated` creates:
```
docs/README.md          → All documentation merged into one file
```

## Practical Examples

### JavaScript Function File
`src/auth/login.js`:
```javascript
// START: login function
/**
 * Authenticates user credentials
 * @param {string} email - User email address
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication result with token
 * @example
 * const result = await login('user@example.com', 'password123');
 */
function login(email, password) {
    console.log('Login attempt for:', email); // DEBUG: remove in prod
    
    if (!email || !password) {
        throw new Error('Email and password required');
    }
    
    return authenticateUser(email, password);
}
// END: login function
```

### CSS Component File
`src/styles/components.css`:
```css
/* START: component styles */

/**
 * Primary button component
 * Used for main call-to-action buttons
 * Variants: .btn-primary, .btn-secondary, .btn-danger
 */
.btn {
    padding: var(--spacing-sm) var(--spacing-md);
    border: none;
    border-radius: var(--border-radius);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: var(--color-primary);
    color: white;
}

/* DEBUG: temporary styling for development */
.btn-debug {
    border: 2px solid red; /* remove in production */
}

/* END: component styles */
```

---

# System Prompt for Coding Agent

```
# ATOMIC FILE STRUCTURE PROTOCOL

You are working with an Atomic File Structure that breaks files into their fundamental, language-native structural components for optimal AI context management.

## CORE PRINCIPLES

1. **Language-Native Divisions**: Break files by how each language naturally structures itself, not by application features
2. **Top-Level Only**: Don't over-abstract - stick to major structural divisions
3. **Zero Configuration**: Automatic dependency resolution and intelligent merging
4. **Documentation Integration**: Rich documentation alongside code with extraction capabilities

## FILE ORGANIZATION BY LANGUAGE

### JavaScript Files - By Declaration Type
**Pattern**: `src/[target]/[declarationType].js`

**Standard divisions**:
- `imports.js` - All import/require statements
- `globals.js` - Constants, configuration, global variables
- `[functionGroup].js` - Logically grouped functions (auth.js, data.js, utils.js)
- `[className].js` - Individual class declarations
- `exports.js` - Export statements

**Example structure**:
```
src/api/
├── imports.js     → import statements for api.js
├── globals.js     → API configuration constants
├── auth.js        → authentication functions
├── data.js        → data processing functions
└── exports.js     → export statements for api.js
```

### HTML Files - By Document Structure
**Pattern**: `src/[target]/[documentSection].html`

**Only two divisions**:
- `head.html` - Everything that goes inside `<head>` tag
- `body.html` - Everything that goes inside `<body>` tag

**Do NOT create**: header.html, footer.html, nav.html, etc.
**DO create**: All page content goes in body.html, all metadata goes in head.html

**Example**:
```
src/dashboard/
├── head.html      → <title>, <meta>, <link>, <script> tags
└── body.html      → All visible page content including header, main, footer
```

### CSS Files - By Cascade Hierarchy  
**Pattern**: `src/[target]/[cascadeLevel].css`

**Standard divisions**:
- `imports.css` - @import statements
- `variables.css` - :root selectors, CSS custom properties
- `base.css` - html, body, *, reset/normalize styles
- `layout.css` - Layout systems (.container, .grid, .flex)
- `components.css` - ALL component styles (.button, .card, .modal, etc.)
- `utilities.css` - Utility classes (.text-center, .hidden, .mt-4)

**Do NOT separate by application components** (header.css, sidebar.css)
**DO separate by CSS structural hierarchy**

## REQUIRED COMPONENT COMMENTS

Every component file MUST include start and end comments:

**JavaScript**:
```javascript
// START: functionName or description
/**
 * Function documentation
 * @param {type} param - description
 * @returns {type} description
 */
function functionName() {
    // implementation
}
// END: functionName or description
```

**HTML**:
```html
<!-- START: head content or body content -->
<div>content here</div>
<!-- END: head content or body content -->
```

**CSS**:
```css
/* START: variables or component styles */
/**
 * Component documentation
 * Usage: class names, variants, examples
 */
.component { /* styles */ }
/* END: variables or component styles */
```

## DOCUMENTATION PRACTICES

Write rich documentation knowing it can be extracted separately:

**Include**:
- Function/component purpose and usage
- Parameters and return values
- Examples and code snippets
- Variants and options
- Dependencies and relationships

**Mark debug content**:
```javascript
console.log('Debug info'); // DEBUG: remove in prod
/* DEBUG: temporary styles for development */
```

## BUILD MODES AWARENESS

**Development Mode** (default):
- Keeps all comments, documentation, debug statements
- Includes TODO/FIXME comments
- Preserves console.log statements

**Production Mode**:
- Strips // DEBUG: comments and statements
- Removes console.log/console.debug
- Keeps essential documentation
- Minifies output

**Documentation Extraction**:
- `--docs-only`: Extract just documentation to docs/ folder
- `--docs-consolidated`: Create single merged documentation file
- `--docs-extract`: Generate docs alongside normal build

## WHEN TO USE ATOMIC STRUCTURE

**Always Use When**:
- File has multiple functions (>2 functions)
- File mixes imports, globals, and logic
- File exceeds 75 lines
- Working on large codebase where AI needs selective context

**Keep Intact When**:
- Single-purpose files with one main function
- Very small utility files (<30 lines)
- Files already well-organized and focused

## WORKFLOW EXAMPLES

### Working with JavaScript:
1. **Discovery**: `ls src/api/` shows: imports.js, globals.js, auth.js, data.js
2. **Selective reading**: Need auth? Read only `src/api/auth.js`
3. **Context optimization**: Load only relevant function files
4. **Modification**: Edit specific function file, system auto-merges

### Working with HTML:
1. **Page structure**: `ls src/dashboard/` shows: head.html, body.html
2. **Metadata changes**: Edit only `head.html` for title, meta tags
3. **Content changes**: Edit only `body.html` for page content
4. **Full page**: System merges into complete HTML document

### Working with CSS:
1. **Style discovery**: `ls src/styles/` shows cascade hierarchy
2. **Variables**: Edit `variables.css` for design tokens
3. **Components**: Edit `components.css` for component styles
4. **Layout**: Edit `layout.css` for layout systems

## AUTOMATIC MERGING RULES

**No configuration needed** - system automatically:
1. **Analyzes content** to determine merge order
2. **Resolves dependencies** using language-specific rules
3. **Orders correctly**: imports → globals → functions → exports
4. **Handles conflicts** intelligently

**JavaScript merge order**:
```
imports.js → globals.js → [functions by dependency] → exports.js
```

**HTML merge order**:
```
<!DOCTYPE html><html> → head.html content → body.html content → </html>
```

**CSS merge order**:
```
imports.css → variables.css → base.css → layout.css → components.css → utilities.css
```

## ERROR PREVENTION

- Always include start/end comments
- Write self-contained components
- Don't assume specific merge order within same type
- Test that components work when merged
- Use semantic, descriptive filenames
- Don't over-abstract - stick to language structure

## CONTEXT OPTIMIZATION FOR AI

- **Discovery**: `find src/ -name "*.js"` to see available functions
- **Selective loading**: Read only needed component files
- **Language separation**: Work with one file type at a time when possible
- **Documentation access**: Use `--docs-only` to read just documentation

Remember: The goal is to work with the fundamental structural components of each language, making it easy for AI to find and work with specific parts while maintaining automatic merging capabilities.
```

This simplified approach focuses on the essential structural divisions of each language without over-engineering, while maintaining powerful documentation and build capabilities!