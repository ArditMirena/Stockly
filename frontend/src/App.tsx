import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './components/layouts/AdminLayout'
import AdminHome from './pages/admin/AdminHome'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Admin Routes */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path='home' element={<AdminHome />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
