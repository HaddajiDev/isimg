"use client"
import "./home.css"
import { useNavigate } from "react-router-dom"
import Silk from "./Backgrounds/Silk"
import Credits from "./Credits"
import PrismaticBurst from "./Backgrounds/PrismaticBurst"

function Home() {
  const navigate = useNavigate()
  const isFilierePersonnaliseeDisabled = false;
  const handleNavigate = (path) => {
      if (path === "/dynamic-class" && isFilierePersonnaliseeDisabled) {
          return; 
      }
      navigate(path);
  };
  return (
    <div className="over">
      <div className="silk-container">
        {/* <PrismaticBurst
            animationType="rotate3d"
            intensity={0.2}
            speed={0.5}
            distort={0}
            paused={false}
            offset={{ x: 0, y: 0 }}
            hoverDampness={0.25}
            rayCount={0}
            mixBlendMode="none"
            colors={['#6c5ce7', '#6c5ce7', '#6c5ce7']}
          /> */}

        <Silk
            speed={7}
            scale={1.1}
            color="#6c5ce7"
            noiseIntensity={1}
            rotation={0}
        />
      </div>

      <div className="container-home">
        <div className="content">
          <h1 className="title">ISIMG</h1>
          <div className="button-container">
            <a className="nav-button" onClick={() => navigate("/lsim1")}>
              LSIM 1
            </a>
            <a className="nav-button" onClick={() => navigate("/lsim2")}>
              LSIM 2
            </a>
            
            <hr className="nav-separator" />

            <a 
              onClick={() => handleNavigate("/dynamic-class")}
              className={`nav-button ${isFilierePersonnaliseeDisabled ? 'disabled' : ''}`}
              href={isFilierePersonnaliseeDisabled ? '#' : '/dynamic-class'}
            >
              Filière Personnalisée (BETA)
            </a>
            <hr className="nav-separator" />

          </div>
          <a
            href="https://github.com/nxxte/isimg"
            target="_blank"
            rel="noopener noreferrer"
            className="github-button"
          >
            <span className="github-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </span>
            <span className="github-text">View on GitHub</span>
          </a>
          <Credits />
        </div>
      </div>
    </div>
  )
}

export default Home