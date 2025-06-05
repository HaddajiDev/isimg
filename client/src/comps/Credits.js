import React from 'react'

function Credits() {
  return (
    <p className="credits">© {new Date().getFullYear()} Made by <a className="credits-name" href="https://github.com/nxxte" target="_blank">Ghaith Belhassen</a> and <a className="credits-name" href="https://haddaji.vercel.app" target="_blank">Ahmed Haddaji</a></p>
  )
}

export default Credits