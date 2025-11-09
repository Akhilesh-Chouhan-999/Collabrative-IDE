# How Code Execution Works in Multi-Collab IDE

## Quick Answer
**No, Monaco Editor does NOT execute your code.** Monaco Editor is just the code editor (the UI where you type code). Code execution happens on your **backend server** using system commands.

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER TYPES CODE                                          │
│     ↓                                                         │
│  Monaco Editor (Frontend)                                    │
│  - Just displays and edits code                             │
│  - Provides syntax highlighting, autocomplete, etc.           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. USER CLICKS "RUN" BUTTON                                 │
│     ↓                                                         │
│  Frontend sends code to backend via API                      │
│  POST /api/room/execute                                      │
│  { code: "...", language: "javascript" }                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. BACKEND EXECUTES CODE                                    │
│     ↓                                                         │
│  code.controller.js (Backend)                                │
│  - Saves code to temporary file                             │
│  - Runs system command:                                      │
│    • JavaScript: node filename.js                            │
│    • Python: python filename.py                             │
│    • Java: javac → java                                      │
│    • C/C++: gcc/g++ → ./executable                           │
│  - Captures output/errors                                    │
│  - Deletes temporary files                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. OUTPUT RETURNED TO FRONTEND                              │
│     ↓                                                         │
│  Frontend displays output in Output panel                    │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Breakdown

### 1. Monaco Editor (Frontend)
**What it does:**
- Provides the code editing interface (like VS Code)
- Syntax highlighting
- Auto-complete
- Bracket matching
- Code formatting

**What it does NOT do:**
- ❌ Execute code
- ❌ Run programs
- ❌ Compile code

**Location:** `client/src/pages/Room.jsx`

### 2. Code Execution (Backend)
**What it does:**
- Receives code from frontend
- Writes code to a temporary file
- Executes the file using system commands
- Captures stdout/stderr
- Returns output to frontend
- Cleans up temporary files

**How it works:**
```javascript
// Example for JavaScript:
1. Save code to: temp/code_123456.js
2. Run: node temp/code_123456.js
3. Capture output
4. Delete temp file
5. Send output to frontend
```

**Location:** `server/src/controllers/code.controller.js`

### 3. System Requirements
For code execution to work, you need these installed on your **server machine**:

| Language | Required Tool | Command Used |
|----------|--------------|--------------|
| JavaScript | Node.js | `node filename.js` |
| Python | Python | `python filename.py` |
| Java | JDK | `javac` then `java` |
| C | GCC | `gcc` then `./executable` |
| C++ | G++ | `g++` then `./executable` |

## Example: Running JavaScript Code

### Step 1: User types code in Monaco Editor
```javascript
console.log("Hello, World!");
```

### Step 2: User clicks "Run" button
Frontend sends:
```javascript
POST /api/room/execute
{
  code: 'console.log("Hello, World!");',
  language: 'javascript'
}
```

### Step 3: Backend executes
```javascript
// Backend creates temp file: temp/code_123456.js
fs.writeFileSync('temp/code_123456.js', code);

// Backend runs: node temp/code_123456.js
const { stdout } = await execAsync('node code_123456.js', { cwd: tempDir });

// Backend deletes temp file
fs.unlinkSync('temp/code_123456.js');

// Backend returns output
res.json({ success: true, output: stdout });
```

### Step 4: Frontend displays output
```
Output:
Hello, World!
```

## Key Points

1. **Monaco Editor = UI only** (code editor interface)
2. **Backend = Actual execution** (runs code using system commands)
3. **Code runs on your server**, not in the browser
4. **Security**: Code execution happens in isolated temp directory with timeout limits

## Why This Architecture?

- **Security**: Code runs on server, not in user's browser
- **Control**: Can limit execution time, resources, etc.
- **Compatibility**: Works with any language that has a command-line compiler/interpreter
- **Isolation**: Each execution uses temporary files that are cleaned up

## Troubleshooting

**Code not running?**
1. Check if required tools are installed (node, python, etc.)
2. Check backend logs for errors
3. Verify the language is supported
4. Check if temp directory has write permissions

**Output not showing?**
1. Check browser console for API errors
2. Check backend response in Network tab
3. Verify authentication (endpoint requires auth)

