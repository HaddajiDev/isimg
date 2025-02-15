import React, { useState } from 'react';
import './lsim1.css';

const LSIM2 = () => {
  const [grades, setGrades] = useState({
    probads: 0, probaex: 0, probatp: 0,
    automatesds: 0, automatesex: 0,
    graphesds: 0, graphesex: 0,
    conceptionds: 0, conceptionex: 0,
    javads: 0, javaex: 0, javatp: 0,
    bsdds: 0, bsdex: 0, bsdtp: 0,
    reseauxds: 0, reseauxex: 0, reseauxtp: 0,
    anglaisds1: 0, anglaisds2: 0, anglaisoral: 0,
    gesds1: 0, gesds2: 0, gesoral: 0,
    webds: 0, webex: 0, webtp: 0,
    animationds: 0, animationex: 0, animationtp: 0
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setGrades(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const proba = grades.probads * 0.15 + grades.probatp * 0.15 + grades.probaex * 0.7;
  const automates = grades.automatesds * 0.3 + grades.automatesex * 0.7;
  const graphes = grades.graphesds * 0.3 + grades.graphesex * 0.7;
  const conception = grades.conceptionds * 0.3 + grades.conceptionex * 0.7;
  const java = grades.javads * 0.15 + grades.javatp * 0.15 + grades.javaex * 0.7;
  const bsd = grades.bsdds * 0.15 + grades.bsdtp * 0.15 + grades.bsdex * 0.7;
  const reseaux = grades.reseauxds * 0.15 + grades.reseauxtp * 0.15 + grades.reseauxex * 0.7;
  const anglais = grades.anglaisds1 * 0.4 + grades.anglaisds2 * 0.4 + grades.anglaisoral * 0.2;
  const ges = grades.gesds1 * 0.4 + grades.gesds2 * 0.4 + grades.gesoral * 0.2;
  const web = grades.webds * 0.15 + grades.webtp * 0.15 + grades.webex * 0.7;
  const animation = grades.animationds * 0.15 + grades.animationtp * 0.15 + grades.animationex * 0.7;

  const overall = (
    proba * 2 + 
    automates * 1 +
    graphes * 1 +
    conception * 1.5 +
    java * 2 +
    bsd * 1.5 +
    reseaux * 1 +
    anglais * 1 +
    ges * 1 +
    web * 1.5 +
    animation * 1.5
  ) / 15;

  const format = (val) => Number(val).toFixed(2);

  return (
    <div className="container">
      <header>
        <h1>LSIM 2</h1>
      </header>

      <form className="form-container">
        <fieldset className="fieldset-result">
          <div id="overall">
            Moyenne Semestre :{' '}
            <b style={{ color: overall < 10 ? 'red' : 'green' }}>
              {format(overall)}
            </b>
          </div>
        </fieldset>

        <div className='warraper'>
          <fieldset>
            <legend>Probabilité</legend>
            <div className='section-overall'>Moyen : <b style={{ color: proba < 10 ? 'red' : 'green' }}>{format(proba)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="probads" min="0" max="20" step="0.25" value={grades.probads} onChange={handleChange} /></p>
                <p>EX <input type="number" id="probaex" min="0" max="20" step="0.25" value={grades.probaex} onChange={handleChange} /></p>
                <p>TP <input type="number" id="probatp" min="0" max="20" step="0.25" value={grades.probatp} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Automates</legend>
            <div className='section-overall'>Moyen : <b style={{ color: automates < 10 ? 'red' : 'green' }}>{format(automates)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="automatesds" min="0" max="20" step="0.25" value={grades.automatesds} onChange={handleChange} /></p>
                <p>EX <input type="number" id="automatesex" min="0" max="20" step="0.25" value={grades.automatesex} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Graphes</legend>
            <div className='section-overall'>Moyen : <b style={{ color: graphes < 10 ? 'red' : 'green' }}>{format(graphes)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="graphesds" min="0" max="20" step="0.25" value={grades.graphesds} onChange={handleChange} /></p>
                <p>EX <input type="number" id="graphesex" min="0" max="20" step="0.25" value={grades.graphesex} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Conception</legend>
            <div className='section-overall'>Moyen : <b style={{ color: conception < 10 ? 'red' : 'green' }}>{format(conception)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="conceptionds" min="0" max="20" step="0.25" value={grades.conceptionds} onChange={handleChange} /></p>
                <p>EX <input type="number" id="conceptionex" min="0" max="20" step="0.25" value={grades.conceptionex} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Java</legend>
            <div className='section-overall'>Moyen : <b style={{ color: java < 10 ? 'red' : 'green' }}>{format(java)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="javads" min="0" max="20" step="0.25" value={grades.javads} onChange={handleChange} /></p>
                <p>EX <input type="number" id="javaex" min="0" max="20" step="0.25" value={grades.javaex} onChange={handleChange} /></p>
                <p>TP <input type="number" id="javatp" min="0" max="20" step="0.25" value={grades.javatp} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>BSD</legend>
            <div className='section-overall'>Moyen : <b style={{ color: bsd < 10 ? 'red' : 'green' }}>{format(bsd)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="bsdds" min="0" max="20" step="0.25" value={grades.bsdds} onChange={handleChange} /></p>
                <p>EX <input type="number" id="bsdex" min="0" max="20" step="0.25" value={grades.bsdex} onChange={handleChange} /></p>
                <p>TP <input type="number" id="bsdtp" min="0" max="20" step="0.25" value={grades.bsdtp} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Réseaux</legend>
            <div className='section-overall'>Moyen : <b style={{ color: reseaux < 10 ? 'red' : 'green' }}>{format(reseaux)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="reseauxds" min="0" max="20" step="0.25" value={grades.reseauxds} onChange={handleChange} /></p>
                <p>EX <input type="number" id="reseauxex" min="0" max="20" step="0.25" value={grades.reseauxex} onChange={handleChange} /></p>
                <p>TP <input type="number" id="reseauxtp" min="0" max="20" step="0.25" value={grades.reseauxtp} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Anglais</legend>
            <div className='section-overall'>Moyen : <b style={{ color: anglais < 10 ? 'red' : 'green' }}>{format(anglais)}</b></div>
            <fieldset>
                <p>DS1 <input type="number" id="anglaisds1" min="0" max="20" step="0.25" value={grades.anglaisds1} onChange={handleChange} /></p>
                <p>DS2 <input type="number" id="anglaisds2" min="0" max="20" step="0.25" value={grades.anglaisds2} onChange={handleChange} /></p>
                <p>Oral <input type="number" id="anglaisoral" min="0" max="20" step="0.25" value={grades.anglaisoral} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Gestion d'entreprise</legend>
            <div className='section-overall'>Moyen : <b style={{ color: ges < 10 ? 'red' : 'green' }}>{format(ges)}</b></div>
            <fieldset>
                <p>DS1 <input type="number" id="gesds1" min="0" max="20" step="0.25" value={grades.gesds1} onChange={handleChange} /></p>
                <p>DS2 <input type="number" id="gesds2" min="0" max="20" step="0.25" value={grades.gesds2} onChange={handleChange} /></p>
                <p>Oral <input type="number" id="gesoral" min="0" max="20" step="0.25" value={grades.gesoral} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Web</legend>
            <div className='section-overall'>Moyen : <b style={{ color: web < 10 ? 'red' : 'green' }}>{format(web)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="webds" min="0" max="20" step="0.25" value={grades.webds} onChange={handleChange} /></p>
                <p>EX <input type="number" id="webex" min="0" max="20" step="0.25" value={grades.webex} onChange={handleChange} /></p>
                <p>TP <input type="number" id="webtp" min="0" max="20" step="0.25" value={grades.webtp} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>

          <fieldset>
            <legend>Animation</legend>
            <div className='section-overall'>Moyen : <b style={{ color: animation < 10 ? 'red' : 'green' }}>{format(animation)}</b></div>
            <fieldset>
                <p>DS <input type="number" id="animationds" min="0" max="20" step="0.25" value={grades.animationds} onChange={handleChange} /></p>
                <p>EX <input type="number" id="animationex" min="0" max="20" step="0.25" value={grades.animationex} onChange={handleChange} /></p>
                <p>TP <input type="number" id="animationtp" min="0" max="20" step="0.25" value={grades.animationtp} onChange={handleChange} /></p>
            </fieldset>
          </fieldset>
        </div>
      </form>

      <fieldset className="fieldset-final">
        <legend>Moyenne Générale</legend>
        <div id="final-overall" style={{ color: overall < 10 ? 'red' : 'green' }}>
          {format(overall)}
        </div>
      </fieldset>

      <p className='credits'>{new Date().getFullYear()} Made by Ghaith Belhassen and Ahmed Haddaji</p>
    </div>
  );
};

export default LSIM2;