import { Routes, Route } from 'react-router-dom'
import Login from './assets/Pages/Login'
import Register from './assets/Pages/Register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App