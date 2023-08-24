import React from 'react'
import { createRoot, type Root } from 'react-dom/client'

document.body.innerHTML = '<div id="app"></div>'

const root: Root = createRoot(document.getElementById('app'))
root.render(<h1>Hello, world</h1>)
