import React from 'react'
import './Backgrounds/Beams.css'
import Particles from './Backgrounds/Particles'
import MagnetLines from './Backgrounds/MagnetLines ';

function NotFound() {
  return (
    <div>
        <div className='effect-container disable-scroll'>
            <Particles
                particleColors={['#ffffff', '#ffffff']}
                particleCount={500}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
            />
        </div>

        <div className='text-container'>
            <MagnetLines
            rows={9}
            columns={9}
            containerSize="40vmin"
            lineColor="#ffffff"
            lineWidth="0.8vmin"
            lineHeight="5vmin"
            baseAngle={0}
            style={{ margin: "1rem auto" }}
            />
        </div>

    </div>
  )
}

export default NotFound