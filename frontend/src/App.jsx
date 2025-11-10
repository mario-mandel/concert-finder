import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Concert Finder</h1>
        <p>Find concerts in Denver</p>
        <p>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </p>
        <p className="read-the-docs">
          Phase 1 Setup Complete! Ready to build.
        </p>
      </header>
    </div>
  )
}

export default App
