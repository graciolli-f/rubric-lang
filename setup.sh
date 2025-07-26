npm create vite@latest expense-tracker -- --template react-ts
cd expense-tracker

npm install
npm install zustand
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

rm -rf src/assets
rm src/App.css
rm -f public/vite.svg

cat > src/App.tsx << 'EOF'
function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Expense Tracker
      </h1>
    </div>
  );
}

export default App;
EOF

cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's/"name": "temp-template"/"name": "expense-tracker"/' package.json
else
  sed -i 's/"name": "temp-template"/"name": "expense-tracker"/' package.json
fi

cd ..

rm -rf base-llm/initial/*
cp -r temp-template/* base-llm/initial/
cp temp-template/.gitignore base-llm/initial/

rm -rf best-practices/initial/*
cp -r temp-template/* best-practices/initial/
cp temp-template/.gitignore best-practices/initial/

rm -rf with-rubric/initial/*
cp -r temp-template/* with-rubric/initial/
cp temp-template/.gitignore with-rubric/initial/

rm -rf temp-template

echo "✅ Template created and copied to all initial folders"
echo ""
echo "Each initial folder now contains:"
ls -la base-llm/initial/
echo ""
echo "To verify everything works:"
echo "cd base-llm/initial && npm run dev"