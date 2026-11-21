import { Routes, Route } from 'react-router-dom'
import Home from './assets/Pages/Home'
import Login from './assets/Pages/Login'
import Register from './assets/Pages/Register'
import UserInfo from './assets/Pages/Userinfo'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/userinfo" element={<UserInfo />} />
    </Routes>
  )
}

export default App