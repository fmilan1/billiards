import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import EightBallMatch from './EightBallMatch'
import { Home } from './screens/Home'
import { Admin } from './screens/Admin'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path='/' Component={Home} />
            <Route path='/admin' Component={Admin} />
            <Route path='/match' Component={EightBallMatch} />
        </Routes>
    </BrowserRouter>
)
