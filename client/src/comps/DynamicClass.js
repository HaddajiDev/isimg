import { useEffect, useState, useMemo, useCallback } from 'react';
import './lsim1.css';
import Credits from './Credits';
import Beams from './Backgrounds/Beams';
import PdfFileUpload from './PdfFileUpload';
import PdfInfoModal from './PdfInfoModal';
import { useSelector } from 'react-redux';


const FeedbackButton = ({ phoneNumber, defaultMessage }) => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    const whatsappGreen = '#25D366';
    const whatsappHover = '#1DA851'; 

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            margin: '30px auto 10px auto',
            paddingTop: '15px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            {/* Contact Text */}
            <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1rem', 
                marginBottom: '10px' 
            }}>
                Problems? Send them over, we'll pretend to be serious:
            </p>

            <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className=" feedback-btn"
                style={{ 
                    backgroundColor: whatsappGreen,
                    border: 'none', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 25px', 
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
                    transition: 'all 0.3s ease-in-out',
                    textTransform: 'uppercase'
                }}
                onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = whatsappHover;
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(37, 211, 102, 0.6)';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = whatsappGreen;
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.4)';
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-4.71-4.71 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.08 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Chat on WhatsApp
            </a>
        </div>
    );
};


const calculateSubjectAvg = (subject) => {
  const { notet, coeff } = subject;
  
  if (!notet || !coeff) return 0;

  let totalWeightedGrade = 0;
  let totalCoefficient = 0;

  for (const key in notet) {

    if (notet[key] !== null && coeff[key] !== null) {
      const grade = notet[key];
      const weight = coeff[key];
      
      totalWeightedGrade += grade * weight;
      totalCoefficient += weight;
    }
  }

  return totalCoefficient > 0.0001 ? totalWeightedGrade / totalCoefficient : 0;
};

const calculateSemesterAvg = (subjects) => {
    if (!subjects || subjects.length === 0) return 0;

    const totalWeightedAvg = subjects.reduce((acc, subject) => {
        const subjectAvg = calculateSubjectAvg(subject);
        return acc + (subjectAvg * subject.coef); 
    }, 0);

    const totalCoefficient = subjects.reduce((acc, subject) => acc + subject.coef, 0);

    return totalCoefficient > 0 ? totalWeightedAvg / totalCoefficient : 0;
};

const DynamicClass = () => {
    const [activeSemester, setActiveSemester] = useState('sem1');
    const [dynamicData, setDynamicData] = useState(null);
    const [error, setError] = useState(null);

    const [isOpenPdf, setIsOpenPdf] = useState(false);
    const [showPdfInfo, setShowPdfInfo] = useState(false);
    
    const dataFromStore = useSelector(state => state.file.data);
    const finalData = dataFromStore ? dataFromStore : localStorage.getItem("any")

    useEffect(() => {
        if (finalData) {
            try {
                
                const initialData = JSON.parse(finalData);

                if (initialData && initialData.sem1 && initialData.sem2) {
                    setDynamicData(initialData);
                    setError(null);
                    
                    if (initialData.sem1.length === 0 && initialData.sem2.length > 0) {
                        setActiveSemester('sem2');
                    } else {
                        setActiveSemester('sem1');
                    }
                } else {
                    throw new Error("Invalid data structure. Missing 'sem1' or 'sem2' arrays.");
                }
            } catch (parseError) {
                setError(`Invalid data format: ${parseError.message}`);
                console.error('JSON parsing error:', parseError);
                setDynamicData(null);
            }
        } else {
            setDynamicData(null);
        }
    }, [finalData]);

    const handleChange = useCallback((semesterKey, subjectIndex, noteKey, value) => {
        const gradeValue = parseFloat(value) || 0;
        
        setDynamicData(prevData => {
            if (!prevData) return prevData;

            const newSubjects = [...prevData[semesterKey]];
            if (newSubjects[subjectIndex] && newSubjects[subjectIndex].notet) {
                
                const clampedValue = Math.min(Math.max(gradeValue, 0), 20); 

                const newNotet = { 
                    ...newSubjects[subjectIndex].notet, 
                    [noteKey]: clampedValue 
                };

                newSubjects[subjectIndex] = {
                    ...newSubjects[subjectIndex],
                    notet: newNotet
                };
                
                return { ...prevData, [semesterKey]: newSubjects };
            }
            return prevData;
        });
    }, []);

    const sem1Subjects = dynamicData?.sem1 || [];
    const sem2Subjects = dynamicData?.sem2 || []; 
    
    const sem1Overall = useMemo(() => calculateSemesterAvg(sem1Subjects), [sem1Subjects]);
    const sem2Overall = useMemo(() => calculateSemesterAvg(sem2Subjects), [sem2Subjects]);
    
    const finalOverall = useMemo(() => {
        const hasSem1 = sem1Subjects.length > 0;
        const hasSem2 = sem2Subjects.length > 0;
        const totalSemesters = (hasSem1 ? 1 : 0) + (hasSem2 ? 1 : 0);
        
        if (totalSemesters === 0) return 0;
        
        const totalAvg = (hasSem1 ? sem1Overall : 0) + (hasSem2 ? sem2Overall : 0);
        return totalAvg / totalSemesters;
    }, [sem1Overall, sem2Overall, sem1Subjects, sem2Subjects]);

    const format = (val) => Number(val).toFixed(2);
    const currentSemesterSubjects = activeSemester === 'sem1' ? sem1Subjects : sem2Subjects;
    const currentSemesterOverall = activeSemester === 'sem1' ? sem1Overall : sem2Overall;

    const possibleNoteKeys = ['ds', 'ds2', 'tp', 'ex', 'oral'];

    const renderSubjectFields = (subject, subjectIndex) => {
        const subjectAvg = calculateSubjectAvg(subject);
        const semesterKey = activeSemester;
        
        return (
            <fieldset key={subject.name + subjectIndex}>
                <legend>{subject.name}</legend>
                <div className='section-overall'>Moyen : <b style={{ color: subjectAvg < 10 ? 'red' : 'green' }}>{format(subjectAvg)}</b></div>
                <fieldset>
                    {possibleNoteKeys.map(key => {
                        if (subject.notet[key] !== null && subject.coeff[key] !== null) {
                            return (
                                <p key={`${subject.name}-${key}`}>
                                    {key.toUpperCase()} <input 
                                        type="number" 
                                        min="0" 
                                        max="20" 
                                        step="0.25" 
                                        value={subject.notet[key]} 
                                        onChange={(e) => handleChange(semesterKey, subjectIndex, key, e.target.value)} 
                                    />
                                </p>
                            );
                        }
                        return null;
                    })}
                </fieldset>
            </fieldset>
        );
    };

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
                <h1>{dynamicData?.filiere || 'Filière Personnalisée'} {dynamicData?.niveau}</h1> 
                
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

                <PdfFileUpload 
                    isOpen={isOpenPdf}
                    onClose={() => setIsOpenPdf(false)}
                    sem={activeSemester === "sem1" ? 1 : 2}
                    section={"any"}
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

            {dynamicData ? (
                <>
                    <div className="switch-container">
                        {dynamicData.sem1 && (
                            <button
                                style={{border: "1px solid #6c5ce7"}}
                                className={activeSemester === 'sem1' ? 'active' : ''}
                                onClick={() => setActiveSemester('sem1')}
                            >
                                1er Semestre
                            </button>
                        )}
                        
                        {dynamicData.sem2 && (
                            <button
                                style={{border: "1px solid #6c5ce7"}}
                                className={activeSemester === 'sem2' ? 'active' : ''}
                                onClick={() => setActiveSemester('sem2')}
                            >
                                2ème Semestre
                            </button>
                        )}
                    </div>

                    {currentSemesterSubjects.length > 0 ? (
                        <form className="form-container">
                            <fieldset className="fieldset-result">
                                <div id="overall">
                                    Moyenne Semestre :{' '}
                                    <b style={{ color: currentSemesterOverall < 10 ? 'red' : 'green' }}>
                                        {format(currentSemesterOverall)}
                                    </b>
                                </div>
                            </fieldset>

                            <div className='warraper'>
                                {currentSemesterSubjects.map(renderSubjectFields)}
                            </div>
                        </form>
                    ) : (
                        <div className="empty-semester-state" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>No subjects loaded for {activeSemester === 'sem1' ? 'Semester 1' : 'Semester 2'}.</p>
                        </div>
                    )}
                    
                    {(sem1Subjects.length > 0 || sem2Subjects.length > 0) && (
                        <fieldset className="fieldset-final">
                            <legend>Moyenne Générale (S1 & S2)</legend>
                            <div id="final-overall" style={{ color: finalOverall < 10 ? 'red' : 'green' }}>
                                {format(finalOverall)}
                            </div>
                        </fieldset>
                    )}
                </>
            ) : (
                <div className="empty-state-card">
                    <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="17" x2="12" y2="11"></line>
                        <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                    <p className="empty-state-title">
                        Téléchargez votre PDF
                        <button
                        className="pdf-info"
                        onClick={() => setShowPdfInfo(true)}
                    >
                        ?
                    </button> 
                    </p>
                    
                    <p className="empty-state-instruction">
                        Veuillez utiliser le bouton "Upload PDF" ci-dessus pour charger vos données de notes. Une fois le fichier traité, vos matières et moyennes apparaîtront automatiquement.
                    </p>
                    <div className="empty-state-warning">
                        ⚠️ Note Importante : Cette fonctionnalité de filière personnalisée est en cours de test et peut contenir des erreurs de lecture.
                    </div>
                </div>
            )}
            <FeedbackButton 
                phoneNumber="21625275999"
                defaultMessage={`Can you fix my oops?. ${dynamicData?.filiere ? dynamicData?.filiere : ""} ${dynamicData?.niveau ? dynamicData?.niveau : ""}`}
            />

            <Credits />
        </div>
        </>
    );
};

export default DynamicClass;