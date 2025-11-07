import React, { useEffect, useState } from 'react';
import './lsim1.css';
import Credits from './Credits';
import Beams from './Backgrounds/Beams';
import LightRays from './Backgrounds/LightRays';
import { getData } from '../redux/FileSlice';
import FileUploadModal from './FileUploadModal';
import PdfFileUpload from './PdfFileUpload';
import PdfInfoModal from './PdfInfoModal';
import { useSelector } from 'react-redux';

const LSIM2 = () => {
  const [activeSemester, setActiveSemester] = useState('sem1');
  
  const [sem1, setSem1] = useState({
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
    animationds: 0, animationex: 0, animationtp: 0,
  });

  const [sem2, setSem2] = useState({
    numds: 0, numex: 0,
    tdids: 0, tdiex: 0, tditp: 0,
    igds: 0, igex: 0, igtp: 0,
    web2ds: 0, web2ex: 0, web2tp: 0,
    appmds: 0, appmex: 0, appmtp: 0,
    aids: 0, aiex: 0, aitp: 0,
    testds: 0, testex: 0, testtp: 0,
    ang2ds1: 0, ang2ds2: 0, ang2oral: 0,
    droitds1: 0, droitds2: 0, droitoral: 0,
    projetds1: 0, projetds2: 0, projettp: 0,
    web3ds: 0, web3ex: 0, web3tp: 0,
    crossds: 0, crossex: 0, crosstp: 0,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    const gradeValue = parseFloat(value) || 0;
    
    if (activeSemester === 'sem1') {
      setSem1(prev => ({ ...prev, [id]: gradeValue }));
    } else {
      setSem2(prev => ({ ...prev, [id]: gradeValue }));
    }
  };

  const proba = sem1.probads * 0.15 + sem1.probatp * 0.15 + sem1.probaex * 0.7;
  const automates = sem1.automatesds * 0.3 + sem1.automatesex * 0.7;
  const graphes = sem1.graphesds * 0.3 + sem1.graphesex * 0.7;
  const conception = sem1.conceptionds * 0.3 + sem1.conceptionex * 0.7;
  const java = sem1.javads * 0.15 + sem1.javatp * 0.15 + sem1.javaex * 0.7;
  const bsd = sem1.bsdds * 0.15 + sem1.bsdtp * 0.15 + sem1.bsdex * 0.7;
  const reseaux = sem1.reseauxds * 0.15 + sem1.reseauxtp * 0.15 + sem1.reseauxex * 0.7;
  const anglais = sem1.anglaisds1 * 0.4 + sem1.anglaisds2 * 0.4 + sem1.anglaisoral * 0.2;
  const ges = sem1.gesds1 * 0.4 + sem1.gesds2 * 0.4 + sem1.gesoral * 0.2;
  const web = sem1.webds * 0.15 + sem1.webtp * 0.15 + sem1.webex * 0.7;
  const animation = sem1.animationds * 0.15 + sem1.animationtp * 0.15 + sem1.animationex * 0.7;

  const sem1_total_coff = 2 + 1 + 1 + 1.5 + 2 + 1.5 + 1 + 1 + 1 + 1.5 + 1.5;
  
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
  ) / sem1_total_coff;


  const coff_num = 1;
  const coff_tdi = 1.5;
  const coff_ig = 1;
  const coff_web2 = 1.5;
  const coff_appm = 1.5;
  const coff_ai = 1.5;
  const coff_test = 1;
  const coff_ang2 = 1;
  const coff_droit = 1;
  const coff_projet = 1;
  const coff_web3 = 1.5;
  const coff_cross = 1.5;
  
  const sem2_total_coffs = coff_num + coff_tdi + coff_ig + coff_web2 + coff_appm + coff_ai + coff_test + coff_ang2 + coff_droit + coff_projet + coff_web3 + coff_cross;

  // Subject Calculations (using sem2 state)
  const num = sem2.numds * 0.3 + sem2.numex * 0.7; 
  const tdi = sem2.tdids * 0.15 + sem2.tditp * 0.15 + sem2.tdiex * 0.7;
  const ig = sem2.igds * 0.15 + sem2.igtp * 0.15 + sem2.igex * 0.7;
  const web2 = sem2.web2ds * 0.15 + sem2.web2tp * 0.15 + sem2.web2ex * 0.7;
  const appm = sem2.appmds * 0.15 + sem2.appmtp * 0.15 + sem2.appmex * 0.7;
  const ai = sem2.aids * 0.15 + sem2.aitp * 0.15 + sem2.aiex * 0.7;
  const test = sem2.testds * 0.15 + sem2.testtp * 0.15 + sem2.testex * 0.7;
  const ang2 = sem2.ang2ds1 * 0.4 + sem2.ang2ds2 * 0.4 + sem2.ang2oral * 0.2;
  const droit = sem2.droitds1 * 0.4 + sem2.droitds2 * 0.4 + sem2.droitoral * 0.2;
  const projet = sem2.projetds1 * 0.4 + sem2.projetds2 * 0.4 + sem2.projettp * 0.2;
  const web3 = sem2.web3ds * 0.15 + sem2.web3tp * 0.15 + sem2.web3ex * 0.7;
  const cross = sem2.crossds * 0.15 + sem2.crosstp * 0.15 + sem2.crossex * 0.7;

  const sem2_overall = (
    num * coff_num + 
    tdi * coff_tdi +
    ig * coff_ig +
    web2 * coff_web2 +
    appm * coff_appm +
    ai * coff_ai +
    test * coff_test +
    ang2 * coff_ang2 +
    droit * coff_droit +
    projet * coff_projet +
    web3 * coff_web3 +
    cross * coff_cross
  ) / sem2_total_coffs;


  const finalOverall = (overall + sem2_overall) / 2;

  const format = (val) => Number(val).toFixed(2);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isOpenPdf, setIsOpenPdf] = useState(false);
  const [showPdfInfo, setShowPdfInfo] = useState(false);

  const data = useSelector(state => state.file.data);

  const [error, setError] = useState(null);

  const loadDataIntoInputs = (data) => {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: Expected an array of subjects');
      }
  
      const newSem1 = { ...sem1 };
      
      data.forEach(subject => {
        if (typeof subject !== 'object' || subject === null) {
          throw new Error('Invalid subject format: Expected an object');
        }
  
        Object.entries(subject).forEach(([key, value]) => {
          if (key === 'subject') return;
  
          if (!newSem1.hasOwnProperty(key)) {
            throw new Error(`Unknown property detected: ${key}`);
          }
  
          if (typeof value !== 'number') {
            throw new Error(`Invalid value type for ${key}: Expected number, got ${typeof value}`);
          }
  
          if (newSem1[key] === 0) {
            newSem1[key] = value;
          }
        });
      });
  
      setSem1(newSem1);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Data loading error:', err);
    }
  };


  const loadDataIntoInputs_2 = (data) => {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: Expected an array of subjects');
      }
  
      const newSem2 = { ...sem2 };
      
      data.forEach(subject => {
        if (typeof subject !== 'object' || subject === null) {
          throw new Error('Invalid subject format: Expected an object');
        }
  
        Object.entries(subject).forEach(([key, value]) => {
          if (key === 'subject') return;
  
          if (!newSem2.hasOwnProperty(key)) {
            throw new Error(`Unknown property detected: ${key}`);
          }
  
          if (typeof value !== 'number') {
            throw new Error(`Invalid value type for ${key}: Expected number, got ${typeof value}`);
          }
  
          if (newSem2[key] === 0) {
            newSem2[key] = value;
          }
        });
      });
  
      setSem2(newSem2);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Data loading error:', err);
    }
  }
  
  useEffect(() => {
    if (data) {
      try {
        const initialData = JSON.parse(data);
        activeSemester === "sem1" ? loadDataIntoInputs(initialData) : loadDataIntoInputs_2(initialData);
      } catch (parseError) {
        setError(`Invalid JSON format: ${parseError.message}`);
        console.error('JSON parsing error:', parseError);
      }
    }
  }, [data]);  

  const renderSubjectFields = (legend, mean, gradeInputs, stateObject) => (
    <fieldset>
      <legend>{legend}</legend>
      <div className='section-overall'>Moyen : <b style={{ color: mean < 10 ? 'red' : 'green' }}>{format(mean)}</b></div>
      <fieldset>
        {gradeInputs.map(input => (
          <p key={input.id}>
            {input.label} <input 
              type="number" 
              id={input.id} 
              min="0" 
              max="20" 
              step="0.25" 
              value={stateObject[input.id]} 
              onChange={handleChange} 
            />
          </p>
        ))}
      </fieldset>
    </fieldset>
  );

  return (
    <>
    <div className="container">
      
      <header>
        <div className="silk-container">
          <Beams
            beamWidth={3}
            beamHeight={30}
            beamNumber={20}
            lightColor="#9370DB"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        </div>
        <h1>LSIM 2</h1>
        <div className="switch-container">
          <button
          style={{border: "1px solid #6c5ce7"}}
            className={activeSemester === 'sem1' ? 'active' : ''}
            onClick={() => setActiveSemester('sem1')}
          >
            1er Semestre
          </button>
          <button
          style={{border: "1px solid #6c5ce7"}}
            className={activeSemester === 'sem2' ? 'active' : ''}
            onClick={() => setActiveSemester('sem2')}
          >
            2ème Semestre
          </button>
        </div>
        
        <br />
        <div className='pdf-container'>
          <button 
            className="btn-new"
            onClick={() => setIsOpenPdf(true)}
          >
            <span>Upload PDF (BETA)</span>
          </button> 
          <button
            className="pdf-info"
            onClick={() => setShowPdfInfo(true)}
          >
            ?
          </button> 
        </div>
        <FileUploadModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}  
            sem={activeSemester === "sem1" ? 1 : 2}
            section={"lsim2"}
        />
        <PdfFileUpload 
          isOpen={isOpenPdf}
          onClose={() => setIsOpenPdf(false)}
          sem={activeSemester === "sem1" ? 1 : 2}
          section={"lsim2"}
          />
        <PdfInfoModal 
          isOpen={showPdfInfo} 
          onClose={() => setShowPdfInfo(false)}          
        />

          {error && (
              <div className="error-banner">
                ⚠️ Error: {error}
                <button onClick={() => setError(null)}>Dismiss</button>
              </div>
          )}
        
      </header>

      {activeSemester === 'sem1' &&       
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
          {renderSubjectFields("Probabilité", proba, [
            { label: 'DS', id: 'probads' },
            { label: 'EX', id: 'probaex' },
            { label: 'TP', id: 'probatp' },
          ], sem1)}

          {renderSubjectFields("Automates", automates, [
            { label: 'DS', id: 'automatesds' },
            { label: 'EX', id: 'automatesex' },
          ], sem1)}

          {renderSubjectFields("Graphes", graphes, [
            { label: 'DS', id: 'graphesds' },
            { label: 'EX', id: 'graphesex' },
          ], sem1)}

          {renderSubjectFields("Conception", conception, [
            { label: 'DS', id: 'conceptionds' },
            { label: 'EX', id: 'conceptionex' },
          ], sem1)}

          {renderSubjectFields("Java", java, [
            { label: 'DS', id: 'javads' },
            { label: 'EX', id: 'javaex' },
            { label: 'TP', id: 'javatp' },
          ], sem1)}

          {renderSubjectFields("BSD", bsd, [
            { label: 'DS', id: 'bsdds' },
            { label: 'EX', id: 'bsdex' },
            { label: 'TP', id: 'bsdtp' },
          ], sem1)}

          {renderSubjectFields("Réseaux", reseaux, [
            { label: 'DS', id: 'reseauxds' },
            { label: 'EX', id: 'reseauxex' },
            { label: 'TP', id: 'reseauxtp' },
          ], sem1)}

          {renderSubjectFields("Anglais", anglais, [
            { label: 'DS1', id: 'anglaisds1' },
            { label: 'DS2', id: 'anglaisds2' },
            { label: 'Oral', id: 'anglaisoral' },
          ], sem1)}

          {renderSubjectFields("Gestion d'entreprise", ges, [
            { label: 'DS1', id: 'gesds1' },
            { label: 'DS2', id: 'gesds2' },
            { label: 'Oral', id: 'gesoral' },
          ], sem1)}

          {renderSubjectFields("Web", web, [
            { label: 'DS', id: 'webds' },
            { label: 'EX', id: 'webex' },
            { label: 'TP', id: 'webtp' },
          ], sem1)}

          {renderSubjectFields("Animation", animation, [
            { label: 'DS', id: 'animationds' },
            { label: 'EX', id: 'animationex' },
            { label: 'TP', id: 'animationtp' },
          ], sem1)}
        </div>
      </form>}


      {activeSemester === 'sem2' && 
      <form className="form-container">
        <fieldset className="fieldset-result">
          <div id="overall">
            Moyenne Semestre :{' '}
            <b style={{ color: sem2_overall < 10 ? 'red' : 'green' }}>
              {format(sem2_overall)}
            </b>
          </div>
        </fieldset>

        <div className='warraper'>
          {renderSubjectFields("Numérisation et codage des objets multimedia", num, [
            { label: 'DS', id: 'numds' },
            { label: 'EX', id: 'numex' },
          ], sem2)}

          {renderSubjectFields("Traitement d'images numériques", tdi, [
            { label: 'DS', id: 'tdids' },
            { label: 'EX', id: 'tdiex' },
            { label: 'TP', id: 'tditp' },
          ], sem2)}

          {renderSubjectFields("Infographie", ig, [
            { label: 'DS', id: 'igds' },
            { label: 'EX', id: 'igex' },
            { label: 'TP', id: 'igtp' },
          ], sem2)}

          {renderSubjectFields("Technologies et programmation web", web2, [
            { label: 'DS', id: 'web2ds' },
            { label: 'EX', id: 'web2ex' },
            { label: 'TP', id: 'web2tp' },
          ], sem2)}

          {renderSubjectFields("Développement d'applications mobiles", appm, [
            { label: 'DS', id: 'appmds' },
            { label: 'EX', id: 'appmex' },
            { label: 'TP', id: 'appmtp' },
          ], sem2)}

          {renderSubjectFields("Fondements & programmation ia", ai, [
            { label: 'DS', id: 'aids' },
            { label: 'EX', id: 'aiex' },
            { label: 'TP', id: 'aitp' },
          ], sem2)}

          {renderSubjectFields("Tests de logiciels (certification istqb)", test, [
            { label: 'DS', id: 'testds' },
            { label: 'EX', id: 'testex' },
            { label: 'TP', id: 'testtp' },
          ], sem2)}

          {renderSubjectFields("Anglais 4", ang2, [
            { label: 'DS1', id: 'ang2ds1' },
            { label: 'DS2', id: 'ang2ds2' },
            { label: 'Oral', id: 'ang2oral' },
          ], sem2)}

          {renderSubjectFields("Droit informatique, protection des données et éthique", droit, [
            { label: 'DS1', id: 'droitds1' },
            { label: 'DS2', id: 'droitds2' },
            { label: 'Oral', id: 'droitoral' },
          ], sem2)}

          {renderSubjectFields("Projet fédéré (méthodo agile)", projet, [
            { label: 'DS1', id: 'projetds1' },
            { label: 'DS2', id: 'projetds2' },
            { label: 'TP', id: 'projettp' },
          ], sem2)}

          {renderSubjectFields("Architecture web", web3, [
            { label: 'DS', id: 'web3ds' },
            { label: 'EX', id: 'web3ex' },
            { label: 'TP', id: 'web3tp' },
          ], sem2)}

          {renderSubjectFields("Développement cross-plateforme d'une application desktop", cross, [
            { label: 'DS', id: 'crossds' },
            { label: 'EX', id: 'crossex' },
            { label: 'TP', id: 'crosstp' },
          ], sem2)}
        </div>
      </form>}


      <fieldset className="fieldset-final">
        <legend>Moyenne Générale (S1 & S2)</legend>
        <div id="final-overall" style={{ color: finalOverall < 10 ? 'red' : 'green' }}>
          {format(finalOverall)}
        </div>
      </fieldset>

      <Credits />
    </div>
    </>
  );
};

export default LSIM2;