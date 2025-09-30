import { useState } from 'react'
import reactLogo from './components/assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Gallery from './pages/Gallery.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <Gallery />
    </>
  )
}

export default App
