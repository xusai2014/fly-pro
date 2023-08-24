import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>'
// Render your React component instead
const root: Root = createRoot(document.getElementById('app'))
root.render(<h1>Hello, world</h1>)
