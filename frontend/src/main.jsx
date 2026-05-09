// ─────────────────────────────────────────────
// main.jsx — React Entry Point
//
// This is where React "starts".
// It finds the <div id="root"> in index.html
// and injects our entire React app into it.
//
// You never need to change this file usually.
// ─────────────────────────────────────────────

import { StrictMode } from 'react'
// StrictMode = React development helper that warns about bad practices

import { createRoot } from 'react-dom/client'
// createRoot = connects React to the actual HTML page

import './index.css'  // global styles applied to whole app
import App from './App.jsx'  // our root component

// Find the <div id="root"> in index.html and render <App /> inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
