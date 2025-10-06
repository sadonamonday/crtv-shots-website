import { useState } from 'react'
import reactLogo from './components/assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './pages/Home'

function App() {
  const [count, setCount] = useState(0)

  return <Home />;
}

export default App
