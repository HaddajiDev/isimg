import React from 'react'
import './home.css'
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

  return (
    <div className='over'>
        <div className="container-home">
            <div className="content">
                <h1 className='title'>ISIMG</h1>
                <div className="button-container">
                    <a className="nav-button" onClick={() => navigate('/lsim1')}>LSIM 1</a>
                    <a className="nav-button" onClick={() => navigate('/lsim2')}>LSIM 2</a>
                </div>
            </div>        
        </div>
        <p className='credits'>© {new Date().getFullYear()} Made by Ghaith Belhassen and Ahmed Haddaji</p>
    </div>
  )
}

export default Home