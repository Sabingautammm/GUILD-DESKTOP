import {Route,Routes,BrowserRouter} from 'react-router-dom'
import Homepage from './components/layout/Homepage'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
function App() {
  return (
    <BrowserRouter>
        <div>
          <Navbar/>
          <Routes>
            <Route  path='/' element={<Homepage/>}  />
          </Routes>
        <Footer/>
        </div>
    </BrowserRouter>

  )
}

export default App