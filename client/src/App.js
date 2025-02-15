import { Route, Routes } from 'react-router-dom';
import Home from './comps/Home';
import LSMI1 from './comps/LSIM1';
import LSIM2 from './comps/LSIM2';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/lsim1' element={<LSMI1 />}/>
        <Route path='/lsim2' element={<LSIM2 />}/>
      </Routes>
      
    </div>
  );
}

export default App;
