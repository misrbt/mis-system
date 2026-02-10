# Laravel Boost Setup

**Location**: Root directory (project-level)
**Laravel Project**: `./backend` folder

---

## 📁 File Structure

```
mis-system/                    (Root - Monorepo)
├── boost.json                 ← Laravel Boost config (moved here)
├── CLAUDE.md                  ← Main project instructions
├── backend/                   (Laravel 12 API)
│   ├── CLAUDE.md             ← Laravel Boost guidelines
│   ├── app/
│   ├── composer.json
│   └── ...
└── frontend/                  (React 19 SPA)
    └── ...
```

---

## 🔧 Configuration

**File**: `boost.json` (root directory)

```json
{
    "agents": [
        "claude_code"
    ],
    "editors": [
        "vscode"
    ],
    "guidelines": [
        "backend/CLAUDE.md"
    ],
    "laravel_path": "./backend"
}
```

### Configuration Explained:
- **`agents`**: Specifies Claude Code as the AI agent
- **`editors`**: VSCode integration enabled
- **`guidelines`**: Points to Laravel-specific guidelines in `backend/CLAUDE.md`
- **`laravel_path`**: Points to the Laravel project location (backend folder)

---

## 📝 Guidelines Files

### 1. Root `CLAUDE.md`
- **Purpose**: Main project instructions for the monorepo
- **Contains**: General project overview, architecture, conventions
- **Used by**: Claude Code for overall project understanding

### 2. Backend `CLAUDE.md`
- **Purpose**: Laravel Boost guidelines for Laravel development
- **Contains**: Laravel 12 specific rules, Boost tool usage, Laravel best practices
- **Used by**: Laravel Boost MCP server for backend work

---

## 🚀 Usage

Laravel Boost will automatically:
- Detect the Laravel project in `./backend`
- Load guidelines from `backend/CLAUDE.md`
- Provide Laravel-specific tools and commands
- Execute artisan commands in the correct directory

### Common Commands (when Laravel Boost is active):
```bash
# Artisan commands run in backend automatically
php artisan migrate
php artisan make:controller

# URLs generated with correct project context
get-absolute-url /api/assets

# Database queries in correct context
database-query "SELECT * FROM assets LIMIT 5"
```

---

## ✅ Why Moved to Root?

**Before**: `backend/boost.json`
- Only worked when in backend directory
- Couldn't manage both frontend and backend

**After**: `boost.json` (root)
- Works from anywhere in the project
- Correctly points to Laravel in `./backend`
- Better for monorepo structure
- Cleaner organization

---

## 🔍 Verification

Check boost.json location:
```bash
ls -la boost.json              # Should exist in root
ls -la backend/boost.json      # Should NOT exist
```

Check configuration:
```bash
cat boost.json
# Should show "laravel_path": "./backend"
```

---

## 📚 Related Files

- `boost.json` - Laravel Boost configuration (root)
- `CLAUDE.md` - Main project instructions (root)
- `backend/CLAUDE.md` - Laravel Boost guidelines
- `backend/composer.json` - Laravel dependencies (includes laravel/boost)

---

**Status**: ✅ Configured and Ready
**Location**: Root directory
**Laravel Path**: `./backend`
**Updated**: February 10, 2026
