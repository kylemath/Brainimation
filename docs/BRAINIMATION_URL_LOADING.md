# BrainImation URL Parameter Loading

## Overview

The BrainImation live editor now supports automatic code loading via URL parameters. This allows you to create direct links to student work that open in the live editor, perfect for portfolio pages and quick access to submitted code.

## URL Parameters

### Basic Usage

```
https://neuroimneurostim.netlify.app/brainimation?sketch=filename.js
```

### Supported Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `sketch` | File path or URL to load | `?sketch=mycode.js` |
| `code` | Alternative to `sketch` | `?code=mycode.js` |
| `autorun` | Auto-run code after loading | `?sketch=mycode.js&autorun=true` |

## Examples

### 1. Load Local File (Relative Path)

```
https://neuroimneurostim.netlify.app/brainimation?sketch=examples/alpha-waves.js
```

Loads a file from the same server (relative path).

### 2. Load from Google Drive

```
https://neuroimneurostim.netlify.app/brainimation?code=https://drive.google.com/uc?export=download&id=FILE_ID
```

Loads code directly from Google Drive using the direct download link.

### 3. Load and Auto-Run

```
https://neuroimneurostim.netlify.app/brainimation?sketch=mycode.js&autorun=true
```

Loads the file and automatically runs it (starts the animation).

### 4. Load from Any URL

```
https://neuroimneurostim.netlify.app/brainimation?code=https://example.com/path/to/code.js
```

Can load from any publicly accessible URL (must support CORS).

## File Type Detection

The portfolio generator automatically detects code files that should open in BrainImation:

**Detected as BrainImation Code:**
- ✅ `.js` files with "brainimation" in the filename
- ✅ `.txt` files (commonly used for midterm submissions)
- ✅ Both Assignment 2 and Midterm code files

**Visual Indicators:**
- 🎮 BrainImation `.js` files
- 📝 Code `.txt` files (midterm)
- Both get the "▶️ Open in Live Editor" button

## Portfolio Integration

The portfolio generator automatically creates proper BrainImation links:

**Generated HTML:**
```html
<a href="https://neuroimneurostim.netlify.app/brainimation?code=https://drive.google.com/uc?export=download&id=FILE_ID" 
   target="_blank" 
   class="btn-brainimation">
    ▶️ Open in Live Editor
</a>
```

**Features:**
- Attractive gradient button styling
- Opens in new tab
- Auto-loads student's code
- Includes helpful instructions
- Shows "View Code" link to original Drive file

## Technical Details

### Implementation

Located in `brainimation.html` as a method of the `CodeEditor` class:

```javascript
async checkAndLoadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const sketchParam = urlParams.get('sketch') || urlParams.get('code');
    
    if (!sketchParam) return;
    
    // Fetch code from URL
    const response = await fetch(sketchParam);
    const code = await response.text();
    
    // Load into editor (now properly initialized)
    this.editor.setValue(code);
    this.lastLoadedCode = code;
    this.lastLoadedFilename = sketchParam;
    
    // Enable reload button
    document.getElementById('reload-btn').disabled = false;
    
    // Auto-run if explicitly requested in URL
    const autoRunParam = urlParams.get('autorun');
    if (autoRunParam === 'true' || autoRunParam === '1') {
        this.runCode();
    }
}
```

**Key Detail:** This method is called **after** Monaco editor initialization completes (inside the `require()` callback), ensuring the editor is ready to receive the code.

### Error Handling

- Shows loading indicator during fetch
- Displays error message if file not found
- Falls back gracefully with alert dialog
- Logs detailed errors to console

### URL Encoding

File paths and URLs are automatically encoded:

```javascript
const editorUrl = `brainimation.html?code=${encodeURIComponent(driveUrl)}`;
```

This handles special characters in filenames.

## User Experience Flow

1. **User clicks "Open in Live Editor" in portfolio**
2. **BrainImation page loads**
   - Shows "Loading filename.js..." status
   - Fetches code from Drive
3. **Code appears in editor**
   - Success message displays
   - Reload button enabled
   - Ready to run
4. **User clicks "Run Code"**
   - Animation starts with their code
   - Can modify and experiment live

## CORS Considerations

### ⚠️ Important: Local Testing Limitation

**Google Drive files CANNOT be loaded when testing locally** due to browser CORS (Cross-Origin Resource Sharing) security.

**Why:**
- `localhost` or `file://` trying to fetch from `drive.google.com`
- Browser blocks cross-origin requests without CORS headers
- Google Drive doesn't provide CORS headers for direct downloads

**Error you'll see:**
```
Access to fetch at 'https://drive.google.com/uc?...' from origin 'http://127.0.0.1' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

### ✅ Files That Work

**When Deployed (Production):**
- ✅ Google Drive links work on `https://neuroimneurostim.netlify.app`
- ✅ HTTPS origins are more trusted by browsers
- ✅ All URL parameter loading works correctly

**Always Work (Local & Deployed):**
- ✅ Same origin files (relative paths)
- ✅ GitHub raw files (have CORS headers)
- ✅ Servers with CORS enabled

### 🧪 Local Testing Workarounds

**Option 1: Manual Load (Recommended for Local Testing)**
1. Click "▶️ Open in Live Editor" from portfolio
2. You'll get CORS error alert
3. Click "📁 Load" button in BrainImation
4. Select the `.txt` file from your computer
5. Code loads and runs ✅

**Option 2: Copy/Paste**
1. Open `.txt` file in Drive
2. Copy the code
3. Paste into BrainImation editor
4. Click "Run Code"

**Option 3: Quick Netlify Deploy (Test Production)**
```bash
# Upload portfolio_test folder to Netlify
cd portfolio_test
netlify deploy
# Test the deployed version - CORS will work!
```

**Option 4: Use Test Server with CORS Proxy**
- Not recommended for simple testing
- Adds complexity

### 🚀 Production Deployment

Once deployed to Netlify/hosting, URL loading works perfectly:
```
https://yoursite.netlify.app/brainimation.html?code=https://drive.google.com/...
                           ✅ HTTPS origin = CORS allowed
```

### 🔍 Testing Checklist

**Local Testing:**
- ❌ URL parameter loading (CORS blocked)
- ✅ Manual file loading
- ✅ Copy/paste code
- ✅ UI and styling
- ✅ Code execution

**Deployed Testing:**
- ✅ URL parameter loading
- ✅ Auto-load from portfolio links
- ✅ All features work
- ✅ Production-ready

### 💡 Best Practice

**Development workflow:**
1. Generate portfolios locally
2. Test UI/layout locally (accept CORS limitations)
3. Deploy to Netlify for full testing
4. Verify URL loading works on deployed site
5. Share deployed links with students

## Examples from Student Portfolios

### Assignment 2 BrainImation

Typical portfolio rendering:

```html
<div class="brainimation-card">
    <h5>🎮 brainimation-2025-10-19T23-27-57.js</h5>
    <div style="display: flex; gap: 10px; margin-top: 10px;">
        <a href="https://neuroimneurostim.netlify.app/brainimation?code=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3D1a2b3c4d5e" 
           target="_blank" 
           class="btn-brainimation">
            ▶️ Open in Live Editor
        </a>
        <a href="https://drive.google.com/file/d/1a2b3c4d5e/view" 
           target="_blank" 
           style="color: var(--muted);">
            View Code
        </a>
    </div>
    <p style="font-size: 0.85em; color: var(--muted);">
        💡 Opens in the live BrainImation editor where you can run and modify the animation
    </p>
</div>
```

### Midterm Submissions

For `.txt` files in Midterm submissions:
- **Automatically detected** - Portfolio generator treats all `.txt` files as BrainImation code
- Same URL format works
- `.txt` extension doesn't matter (it's just JavaScript code)
- Can load and run exactly like `.js` files
- Shows as "📝 Code File • P5.js Code" with live editor button

**Example:**
```html
📝 Anderson_Midterm_part2 - Tori Anderson.txt
Code File • P5.js Code
┌─────────────────────────────────────┐
│ ▶️ Open in Live Editor              │
│ 📄 View Code on Drive               │
└─────────────────────────────────────┘
💡 Opens in the live BrainImation editor...
```

## Benefits

### For Students
- 📱 Easy sharing of their work
- 🔗 Direct links to running animations
- 🎨 Others can remix their code
- 💾 Original code preserved on Drive

### For Instructors
- ⚡ Quick code review
- 🎯 Direct access from portfolios
- 📊 Easy demonstration to class
- 🔄 No manual file downloads

### For Portfolios
- 🌟 Interactive, not just static
- 🎮 Showcases live animations
- 📈 Professional presentation
- 🔗 Seamless integration

## Limitations

### File Size
- Works best with code < 500 KB
- Large files (>1MB) may be slow

### Privacy
- Only works with public/shared Drive files
- Cannot load private files without auth

### Browser Support
- Requires modern browsers (ES6+)
- Needs JavaScript enabled
- URLSearchParams API required

## Future Enhancements

Possible improvements:
- [ ] Support for GitHub gists
- [ ] Embed mode (iframe without editor chrome)
- [ ] Permalink generation
- [ ] Code diff/version comparison
- [ ] Collaborative editing mode

## Troubleshooting

### Link Opens But Code Doesn't Load

**Check:**
1. Is file publicly accessible?
2. Check browser console for errors
3. Try opening Drive link directly
4. Verify URL encoding is correct

**Solution:**
```javascript
// Verify URL is properly encoded
const encoded = encodeURIComponent('https://drive.google.com/...');
console.log(encoded); // Should show %3A%2F%2F etc.
```

### Code Loads and Runs But Editor Shows Default Example

**Symptoms:** 
- Console shows "Code loaded successfully"
- Animation runs correctly
- But editor display still shows starting example

**Cause:** Race condition - default code auto-runs before URL code finishes loading (FIXED in latest version)

**Solution:** 
This issue is now fixed. The system now:

1. **Waits** for URL code to load completely
2. **Then** decides whether to auto-run default code
3. Only runs default if **no** URL parameter was present

**Fixed behavior:**
```
With URL: Load from URL → Show in editor → Wait (don't auto-run default)
No URL:   Show default → Auto-run default
```

If you still see this issue:
1. **Hard refresh** (Cmd+Shift+R / Ctrl+Shift+R) to clear cache
2. Check console for:
   - "✅ Code loaded successfully from URL"
   - "📄 Code length: XXX characters"
   - "⏸️ Code loaded but not auto-running"
3. Verify you're using latest `brainimation.html`

### Default Code Runs Instead of URL Code

**Symptoms:**
- URL has `?code=...` parameter
- Console shows "Auto-running initial code..."
- Default example runs instead of student code

**Cause:** Old version with race condition

**Solution:** Update to latest version where URL loading completes **before** any auto-run

### "Failed to Load" Error

**Symptoms:** Alert dialog with error message

**Common Causes:**
1. File not found (404)
2. CORS blocked
3. Network error
4. Invalid URL

**Debug Steps:**
```javascript
// Open browser console
// Look for fetch error details
// Try fetching manually:
fetch('YOUR_URL').then(r => r.text()).then(console.log).catch(console.error);
```

### Code Loads But Won't Run

**Check:**
1. Syntax errors in code?
2. Check system log tab
3. Look for missing functions
4. Verify EEG data source

## Related Documentation

- `PORTFOLIO_GENERATOR_GUIDE.md` - Portfolio generation overview
- `PORTFOLIO_IMAGE_EMBEDDING.md` - Image embedding details
- See [BrainImation live site](https://neuroimneurostim.netlify.app/brainimation) for the editor

## Code Locations

**BrainImation URL Handler:**
- File: `brainimation.html`
- Function: `checkAndLoadFromURL()`
- Lines: ~5520-5610

**Portfolio Generator:**
- File: `portfolio_generator.js`
- Function: `renderFilesWithPDFContent()`
- Lines: ~400-410

**Styles:**
- File: `portfolio_generator.js`
- Function: `getPortfolioCSS()`
- Classes: `.brainimation-card`, `.btn-brainimation`

