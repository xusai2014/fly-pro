import { createRoot, type Root } from 'react-dom/client'
import * as React from 'react'

const dom = document.getElementById('app')

if (dom !== null) {
  const root: Root = createRoot(dom)
  root.render(<h1>Hello, world</h1>)
}
