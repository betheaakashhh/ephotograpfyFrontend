import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Landing from './page/Landing/Landing.jsx'
import Main from './page/main/Main.jsx'
const App = () => {
  return (
    <div className="App">
        <Routes >
         <Route path='/' element={<Landing/>} />
         <Route path='/ephotografy' element={<Main/>} />
        </Routes>
        
        
        
        
        
    </div>
  )
}

export default App