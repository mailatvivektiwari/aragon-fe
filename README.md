# Frontend - Kanban Board Management System

Frontend application built with React, TypeScript, and React Router for the Kanban Board Management System.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd assignment/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19
- TypeScript
- React Router DOM
- Axios
- And more...

**Note:** This may take a few minutes depending on your internet connection.

### Step 3: Set Up Environment Variables (Optional)

Create a `.env` file in the `frontend` directory if you need to customize the API URL:

```bash
# Create .env file
touch .env
```

Add the following to `.env`:

```env
# API Configuration (optional)
REACT_APP_API_URL=http://localhost:3001/api
```

**Note:** If you don't create this file, the app will default to `http://localhost:3001/api`.

## ▶️ Running the Application

### Development Mode

```bash
npm start
```

This will:
- Start the development server
- Open `http://localhost:3000` in your browser automatically
- Enable hot reload (page refreshes automatically when you save files)
- Show compilation errors and warnings in the console

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` folder:
- Minified JavaScript and CSS
- Optimized assets
- Production-ready files

To serve the production build:

```bash
# Install a simple HTTP server
npm install -g serve

# Serve the build folder
serve -s build
```

Or use any static file server:
- **Nginx**
- **Apache**
- **Vercel**
- **Netlify**
- **AWS S3 + CloudFront**

## 🧪 Testing the Installation

### 1. Verify Development Server

After running `npm start`, you should see:
- Browser opens automatically to `http://localhost:3000`
- Login page displays
- No console errors

### 2. Test Login

1. Navigate to `http://localhost:3000`
2. Enter credentials:
   - Email: `admin@kanban.com`
   - Password: `admin123`
3. Click "Sign In"
4. You should be redirected to the dashboard

### 3. Verify Backend Connection

Make sure the backend server is running on `http://localhost:3001`:

```bash
# In another terminal, check backend health
curl http://localhost:3001/health
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html       # HTML template
│   └── ...              # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── Dashboard.tsx
│   │   ├── BoardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useBoards.ts
│   │   └── useTasks.ts
│   ├── services/       # API service layer
│   │   └── api.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── App.tsx         # Main app component
│   ├── index.tsx       # Entry point
│   └── index.css       # Global styles
├── build/              # Production build (generated)
├── .env                # Environment variables (optional)
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 🛠️ Available Scripts

```bash
# Development
npm start                # Start development server

# Building
npm run build            # Create production build

# Testing
npm test                 # Run tests in watch mode
npm test -- --coverage   # Run tests with coverage

# Other
npm run eject            # Eject from Create React App (not recommended)
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | No | `http://localhost:3001/api` | Backend API URL |

### Changing API URL

**Option 1: Environment Variable**

Create `.env` file:
```env
REACT_APP_API_URL=http://your-backend-url:3001/api
```

**Option 2: Update Code**

Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Error:** `Something is already running on port 3000`

**Solution:**
```bash
# Option 1: Kill the process
lsof -ti:3000 | xargs kill

# Option 2: Use different port
PORT=3002 npm start
```

### Issue: Cannot Connect to Backend

**Error:** `Network Error` or `Failed to fetch`

**Solutions:**

1. **Verify Backend is Running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check CORS Configuration:**
   - Verify `CORS_ORIGIN` in backend `.env` includes `http://localhost:3000`
   - Restart backend server after changing `.env`

3. **Check API URL:**
   - Verify `REACT_APP_API_URL` in frontend `.env` matches backend URL
   - Restart frontend server after changing `.env`

4. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Network tab for failed requests
   - Check Console for error messages

### Issue: Module Not Found Errors

**Error:** `Cannot find module '...'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build Fails

**Error:** Build errors or warnings

**Solutions:**

1. **Check TypeScript Errors:**
   ```bash
   npm run build
   # Fix any TypeScript errors shown
   ```

2. **Clear Cache:**
   ```bash
   rm -rf node_modules package-lock.json build
   npm install
   npm run build
   ```

### Issue: Page Not Loading

**Error:** Blank page or errors

**Solutions:**

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed requests

2. **Verify Backend Connection:**
   - Ensure backend is running
   - Check if API endpoints are accessible

3. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache manually

## 🔐 Authentication

### Login Credentials

- **Email**: `admin@kanban.com`
- **Password**: `admin123`

### Authentication Flow

1. User logs in with email/password
2. Backend validates credentials
3. Frontend receives JWT token
4. Token stored in localStorage
5. Token sent with each API request via Authorization header
6. Protected routes check for valid token

## 🎨 Features

- **Dark/Light Theme**: Toggle theme using the theme switcher in sidebar
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Drag & Drop**: Intuitive task management with drag-and-drop
- **Real-time Updates**: Instant UI updates when data changes

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📦 Build Output

The `build` folder contains:
- `index.html` - Main HTML file
- `static/css/` - Compiled CSS files
- `static/js/` - Compiled JavaScript files
- `static/media/` - Images and other assets

## 🔄 Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Make Changes:**
   - Edit files in `src/`
   - Browser auto-refreshes on save
   - Check console for errors

4. **Test Changes:**
   - Test in browser
   - Check Network tab for API calls
   - Verify functionality works end-to-end

## 📄 License

ISC

## 📞 Support

For issues and questions:
- Check the main README.md in the root directory
- Review browser console for errors
- Check backend logs for API errors
- Open an issue on the repository
