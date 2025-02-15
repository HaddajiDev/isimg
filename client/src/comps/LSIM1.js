import React, { useState } from 'react';
import './lsim1.css';

const LSIM1 = () => {
  const [activeSemester, setActiveSemester] = useState('sem1');

  const [sem1, setSem1] = useState({
    // Mathématique
    dsa: 0, exa: 0,
    dsal: 0, exal: 0,
    // Algorithmique & Programmation
    dsalo: 0, exalo: 0,
    dsprog: 0, exaprog: 0, tpprog: 0,
    // Systèmes d'exploitation et architecture
    dsse: 0, exase: 0, tpse: 0,
    dssl: 0, examensl: 0, tpsl: 0,
    // Logique et multimédia
    dslf: 0, exalf: 0,
    dsmm: 0, examm: 0, tpmm: 0,
    // Langue
    oralang: 0, dsang: 0, exaang: 0,
    oralfr: 0, dsfr: 0, exafr: 0
  });

  const [sem2, setSem2] = useState({
    // Mathématique
    dsa: 0, exa: 0,
    dsal: 0, exal: 0,
    // Algorithmique & Programmation
    dsalo: 0, exalo: 0,
    dsprog: 0, exaprog: 0, tpprog: 0,
    dsprogp: 0, exaprogp: 0, tpprogp: 0,
    // Systèmes d'exploitation et architecture
    dsse: 0, exase: 0, tpse: 0,
    dssl: 0, tpsl: 0, examensl: 0,
    // Fondements des bases de données
    dslf: 0, exalf: 0,
    // Langue
    oralang: 0, dsang: 0, exaang: 0,
    oralfr: 0, dsfr: 0, exafr: 0,
    oralfrr: 0, dsfrr: 0, exafrr: 0
  });

  const handleSem1Change = (e) => {
    const { id, value } = e.target;
    setSem1(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const handleSem2Change = (e) => {
    const { id, value } = e.target;
    setSem2(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const sem1_ana      = sem1.dsa   * 0.3 + sem1.exa   * 0.7;
  const sem1_algebre  = sem1.dsal  * 0.3 + sem1.exal  * 0.7;
  const sem1_math     = (sem1_ana + sem1_algebre) / 2;

  const sem1_alo      = sem1.dsalo * 0.3 + sem1.exalo * 0.7;
  const sem1_prog     = sem1.dsprog * 0.15 + sem1.exaprog * 0.7 + sem1.tpprog * 0.15;
  const sem1_info     = (sem1_prog * 1.5 + sem1_alo * 2) / 3.5;

  const sem1_se       = sem1.dsse  * 0.15 + sem1.exase  * 0.7 + sem1.tpse  * 0.15;
  const sem1_sl       = sem1.dssl  * 0.15 + sem1.examensl * 0.7 + sem1.tpsl  * 0.15;
  const sem1_seg      = (sem1_se * 1.5 + sem1_sl * 2) / 3.5;

  const sem1_lf       = sem1.dslf  * 0.3 + sem1.exalf  * 0.7;
  const sem1_mm       = sem1.dsmm  * 0.15 + sem1.examm  * 0.7 + sem1.tpmm  * 0.15;
  const sem1_lm       = (sem1_lf + sem1_mm) / 2;

  const sem1_ang      = sem1.oralang * 0.2 + sem1.dsang  * 0.4 + sem1.exaang * 0.4;
  const sem1_fr       = sem1.oralfr  * 0.2 + sem1.dsfr   * 0.4 + sem1.exafr  * 0.4;
  const sem1_lang     = (sem1_ang + sem1_fr) / 2;

  const sem1_overall  = (sem1_math * 3 + sem1_info * 3.5 + sem1_seg * 3.5 + sem1_lm * 3 + sem1_lang * 2) / 15;

  const sem2_ana      = sem2.dsa   * 0.3 + sem2.exa   * 0.7;
  const sem2_algebre  = sem2.dsal  * 0.3 + sem2.exal  * 0.7;
  const sem2_math     = (sem2_ana + sem2_algebre) / 2;

  const sem2_alo      = sem2.dsalo * 0.3 + sem2.exalo * 0.7;
  const sem2_prog     = sem2.dsprog * 0.15 + sem2.exaprog * 0.7 + sem2.tpprog * 0.15;
  const sem2_progp    = sem2.dsprogp * 0.15 + sem2.exaprogp * 0.7 + sem2.tpprogp * 0.15;
  const sem2_info     = (sem2_prog + sem2_progp + 1.5 * sem2_alo) / 3.5;

  const sem2_se       = sem2.dsse  * 0.15 + sem2.exase  * 0.7 + sem2.tpse  * 0.15;
  const sem2_sl       = sem2.dssl  * 0.15 + sem2.examensl * 0.7 + sem2.tpsl  * 0.15;
  const sem2_seg      = (sem2_se * 1.5 + sem2_sl * 2) / 3.5;

  const sem2_lm       = sem2.dslf  * 0.3 + sem2.exalf  * 0.7;

  const sem2_ang      = sem2.oralang * 0.2 + sem2.dsang  * 0.4 + sem2.exaang * 0.4;
  const sem2_fr       = sem2.oralfr  * 0.2 + sem2.dsfr   * 0.4 + sem2.exafr  * 0.4;
  const sem2_frr      = sem2.oralfrr * 0.2 + sem2.dsfrr  * 0.4 + sem2.exafrr * 0.4;
  const sem2_lang     = (sem2_ang + sem2_fr + sem2_frr) / 3;

  const sem2_overall  = (sem2_math * 3 + sem2_info * 3.5 + sem2_seg * 3.5 + sem2_lm * 2 + sem2_lang * 3) / 15;

  const finalOverall  = (sem1_overall + sem2_overall) / 2;

  const format = (val) => Number(val).toFixed(2);

  return (
    <div className="container">
      <header>
        <h1>LSIM 1</h1>
        <div className="switch-container">
          <button
            className={activeSemester === 'sem1' ? 'active' : ''}
            onClick={() => setActiveSemester('sem1')}
          >
            1er Semestre
          </button>
          <button
            className={activeSemester === 'sem2' ? 'active' : ''}
            onClick={() => setActiveSemester('sem2')}
          >
            2ème Semestre
          </button>
        </div>
      </header>

      {activeSemester === 'sem1' && (
        <form className="form-container">
          <fieldset className="fieldset-result">
          <div id="sem1-overall">
            Moyen Semestre 1 :{' '}
            <b style={{ color: sem1_overall < 10 ? 'red' : 'green' }}>
                {format(sem1_overall)}
            </b>
            </div>
          </fieldset>
          <div className='warraper'>
            {/* Mathématique */}
            <fieldset>
                <legend>Mathématique</legend>
                <div className='section-overall'>Moyen : <b style={{ color: sem1_math < 10 ? 'red' : 'green' }}>{format(sem1_math)}</b></div>
                <fieldset>
                <legend>Algèbre</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_algebre < 10 ? 'red' : 'green' }}>{format(sem1_algebre)}</b></div>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dsal"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dsal}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="exal"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.exal}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
                <fieldset>
                <legend>Analyse</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_ana < 10 ? 'red' : 'green' }}>{format(sem1_ana)}</b></div>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dsa"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dsa}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="exa"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.exa}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
            </fieldset>

            {/* Algorithmique & Programmation */}
            <fieldset>
                <legend>Algorithmique & Programmation</legend>
                <div className='section-overall'>Moyen : <b style={{ color: sem1_info < 10 ? 'red' : 'green' }}>{format(sem1_info)}</b></div>
                <fieldset>
                <legend>Algorithme</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_alo < 10 ? 'red' : 'green' }}>{format(sem1_alo)}</b></div>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dsalo"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dsalo}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="exalo"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.exalo}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
                <fieldset>
                <legend>Programmation</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_prog < 10 ? 'red' : 'green' }}>{format(sem1_prog)}</b></div>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dsprog"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dsprog}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="exaprog"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.exaprog}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    tp{' '}
                    <input
                    type="number"
                    id="tpprog"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.tpprog}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
            </fieldset>

            {/* Systèmes d'exploitation et architecture */}
            <fieldset>
                <legend>Systèmes d'exploitation et architecture</legend>
                <div className='section-overall'>Moyen : <b style={{ color: sem1_seg < 10 ? 'red' : 'green' }}>{format(sem1_seg)}</b></div>
                <fieldset>
                <legend>Systèmes d'exploitation</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_se < 10 ? 'red' : 'green' }}>{format(sem1_se)}</b></div>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dsse"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dsse}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="exase"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.exase}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    tp{' '}
                    <input
                    type="number"
                    id="tpse"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.tpse}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
                <fieldset>
                <legend>Systèmes logique</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_sl < 10 ? 'red' : 'green' }}>{format(sem1_sl)}</b></div>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dssl"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dssl}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="examensl"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.examensl}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    tp{' '}
                    <input
                    type="number"
                    id="tpsl"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.tpsl}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
            </fieldset>

            {/* Logique et multimédia */}
            <fieldset>
                <legend>Logique et multimédia</legend>
                <div className='section-overall'>Moyen : <b style={{ color: sem1_lm < 10 ? 'red' : 'green' }}>{format(sem1_lm)}</b></div>
                <fieldset>
                <legend>Logique formelle</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_lf < 10 ? 'red' : 'green' }}>{format(sem1_lf)}</b></div>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dslf"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dslf}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="exalf"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.exalf}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
                <fieldset>
                <legend>Technologies multimédia</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_mm < 10 ? 'red' : 'green' }}>{format(sem1_mm)}</b></div>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dsmm"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dsmm}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="examm"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.examm}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    tp{' '}
                    <input
                    type="number"
                    id="tpmm"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.tpmm}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
            </fieldset>

            {/* Langue */}
            <fieldset>
                <legend>Langue</legend>
                <div className='section-overall'>Moyen : <b style={{ color: sem1_lang < 10 ? 'red' : 'green' }}>{format(sem1_lang)}</b></div>
                <fieldset>
                <legend>Anglais</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_ang < 10 ? 'red' : 'green' }}>{format(sem1_ang)}</b></div>
                <p>
                    oral{' '}
                    <input
                    type="number"
                    id="oralang"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.oralang}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dsang"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dsang}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="exaang"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.exaang}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
                <fieldset>
                <legend>Français</legend>
                <div className='subject-average'>Moyen: <b style={{ color: sem1_fr < 10 ? 'red' : 'green' }}>{format(sem1_fr)}</b></div>
                <p>
                    oral{' '}
                    <input
                    type="number"
                    id="oralfr"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.oralfr}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    ds{' '}
                    <input
                    type="number"
                    id="dsfr"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.dsfr}
                    onChange={handleSem1Change}
                    />
                </p>
                <p>
                    examen{' '}
                    <input
                    type="number"
                    id="exafr"
                    min="0"
                    max="20"
                    step="0.25"
                    value={sem1.exafr}
                    onChange={handleSem1Change}
                    />
                </p>
                </fieldset>
            </fieldset>
          </div>
        </form>
      )}

      {activeSemester === 'sem2' && (
        <form className="form-container">
          <fieldset className="fieldset-result">
          <div id="sem2-overall">
            Moyen Semestre 2 : <b style={{ color: sem2_overall < 10 ? 'red' : 'green' }}>{format(sem2_overall)}</b>
           </div>
          </fieldset>
          <div className='warraper'>
          {/* Mathématique */}
        <fieldset>
            <legend>Mathématique</legend>
            <div className='section-overall'>Moyen : <b style={{ color: sem2_math < 10 ? 'red' : 'green' }}>{format(sem2_math)}</b></div>
            <fieldset>
              <legend>Algèbre</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_algebre < 10 ? 'red' : 'green' }}>{format(sem2_algebre)}</b></div>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsal"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsal}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exal"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exal}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
            <fieldset>
              <legend>Analyse</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_ana < 10 ? 'red' : 'green' }}>{format(sem2_ana)}</b></div>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsa"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsa}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exa"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exa}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
        </fieldset>

          {/* Algorithmique & Programmation */}
          <fieldset>
            <legend>Algorithmique & Programmation</legend>
            <div className='section-overall'>Moyen : <b style={{ color: sem2_info < 10 ? 'red' : 'green' }}>{format(sem2_info)}</b></div>
            <fieldset>
              <legend>Algorithme</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_alo < 10 ? 'red' : 'green' }}>{format(sem2_alo)}</b></div>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsalo"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsalo}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exalo"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exalo}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
            <fieldset>
              <legend>Programmation C</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_prog < 10 ? 'red' : 'green' }}>{format(sem2_prog)}</b></div>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsprog"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsprog}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                tp{' '}
                <input
                  type="number"
                  id="tpprog"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.tpprog}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exaprog"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exaprog}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
            <fieldset>
              <legend>Programmation Python</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_progp < 10 ? 'red' : 'green' }}>{format(sem2_progp)}</b></div>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsprogp"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsprogp}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                tp{' '}
                <input
                  type="number"
                  id="tpprogp"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.tpprogp}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exaprogp"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exaprogp}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
          </fieldset>

          {/* Systèmes d'exploitation et architecture */}
          <fieldset>
            <legend>Systèmes d'exploitation et architecture</legend>
            <div className='section-overall'>Moyen : <b style={{ color: sem2_seg < 10 ? 'red' : 'green' }}>{format(sem2_seg)}</b></div>
            <fieldset>
              <legend>Systèmes d'exploitation</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_se < 10 ? 'red' : 'green' }}>{format(sem2_se)}</b></div>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsse"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsse}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exase"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exase}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                tp{' '}
                <input
                  type="number"
                  id="tpse"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.tpse}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
            <fieldset>
              <legend>Fondements des réseaux</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_sl < 10 ? 'red' : 'green' }}>{format(sem2_sl)}</b></div>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dssl"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dssl}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                tp{' '}
                <input
                  type="number"
                  id="tpsl"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.tpsl}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="examensl"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.examensl}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
          </fieldset>

          {/* Fondements des bases de données */}
          <fieldset>
            <legend>Fondements des bases de données</legend>
            <fieldset>
            <legend>Fondements des bases de données</legend>
            <div className='subject-average'>Moyen: <b style={{ color: sem2_lm < 10 ? 'red' : 'green' }}>{format(sem2_lm)}</b></div>
            <p>
              ds{' '}
              <input
                type="number"
                id="dslf"
                min="0"
                max="20"
                step="0.25"
                value={sem2.dslf}
                onChange={handleSem2Change}
              />
            </p>
            <p>
              examen{' '}
              <input
                type="number"
                id="exalf"
                min="0"
                max="20"
                step="0.25"
                value={sem2.exalf}
                onChange={handleSem2Change}
              />
            </p>
            </fieldset>
          </fieldset>

          {/* Langue */}
          <fieldset>            
            <legend>Langue</legend>
            <div className='section-overall'>Moyen : <b style={{ color: sem2_lang < 10 ? 'red' : 'green' }}>{format(sem2_lang)}</b></div>
            <fieldset>
              <legend>Anglais</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_ang < 10 ? 'red' : 'green' }}>{format(sem2_ang)}</b></div>
              <p>
                oral{' '}
                <input
                  type="number"
                  id="oralang"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.oralang}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsang"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsang}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exaang"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exaang}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
            <fieldset>
              <legend>Français</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_fr < 10 ? 'red' : 'green' }}>{format(sem2_fr)}</b></div>
              <p>
                oral{' '}
                <input
                  type="number"
                  id="oralfr"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.oralfr}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsfr"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsfr}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exafr"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exafr}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
            <fieldset>
              <legend>Culture et compétence numérique</legend>
              <div className='subject-average'>Moyen: <b style={{ color: sem2_frr < 10 ? 'red' : 'green' }}>{format(sem2_frr)}</b></div>
              <p>
                oral{' '}
                <input
                  type="number"
                  id="oralfrr"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.oralfrr}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                ds{' '}
                <input
                  type="number"
                  id="dsfrr"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.dsfrr}
                  onChange={handleSem2Change}
                />
              </p>
              <p>
                examen{' '}
                <input
                  type="number"
                  id="exafrr"
                  min="0"
                  max="20"
                  step="0.25"
                  value={sem2.exafrr}
                  onChange={handleSem2Change}
                />
              </p>
            </fieldset>
        
        </fieldset>
        </div>
        </form>
      )}

      <fieldset className="fieldset-final">
        <legend>Moyenne Générale de l'année</legend>
        <div id="final-overall">{format(finalOverall)}</div>
      </fieldset>
      <p className='credits'>© {new Date().getFullYear()} Made by Ghaith Belhassen and Ahmed Haddaji</p>
    </div>
    
  );

};

export default LSIM1;
