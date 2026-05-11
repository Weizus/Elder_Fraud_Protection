import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { Routes, Route } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import "./App.css"


function App() {
  return (
    <Routes>
      <Route path ="/" element = {<Home/>}/>
      <Route path = "/login" element ={<LoginPage/>}/>
      <Route path="/sign-up" element ={<SignUpPage/>}/>
      <Route path="/dashboard" element ={<DashboardPage/>}/>
    </Routes>
  )
}

export default App
