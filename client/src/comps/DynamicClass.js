import { useEffect, useState, useMemo, useCallback } from 'react';
import './lsim1.css';
import Credits from './Credits';
import Beams from './Backgrounds/Beams';
import PdfFileUpload from './PdfFileUpload';
import PdfInfoModal from './PdfInfoModal';
import { useSelector } from 'react-redux';

const calculateSubjectAvg = (notes) => {
  if (!notes || notes.length === 0) return 0;

  const totalWeightedGrade = notes.reduce((acc, note) => {
    return acc + (note.note * note.cs);
  }, 0);

  const totalCoefficient = notes.reduce((acc, note) => {
    return acc + note.cs;
  }, 0);

  return totalWeightedGrade;
};

const calculateSemesterAvg = (subjects) => {
    if (!subjects || subjects.length === 0) return 0;

    const totalWeightedAvg = subjects.reduce((acc, subject) => {
        const subjectAvg = calculateSubjectAvg(subject.notes);
        return acc + (subjectAvg * subject.coeff);
    }, 0);

    const totalCoefficient = subjects.reduce((acc, subject) => acc + subject.coeff, 0);

    return totalWeightedAvg / totalCoefficient;
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
                    throw new Error("Invalid data structure. Missing 'sem1' or 'sem2'.");
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

    const handleChange = useCallback((semesterKey, subjectIndex, noteIndex, value) => {
        const gradeValue = parseFloat(value) || 0;
        
        setDynamicData(prevData => {
            if (!prevData) return prevData;

            const newSubjects = [...prevData[semesterKey]];
            if (newSubjects[subjectIndex] && newSubjects[subjectIndex].notes[noteIndex]) {
                const newNotes = [...newSubjects[subjectIndex].notes];
                newNotes[noteIndex] = { 
                    ...newNotes[noteIndex], 
                    note: Math.min(Math.max(gradeValue, 0), 20)
                };
                newSubjects[subjectIndex] = {
                    ...newSubjects[subjectIndex],
                    notes: newNotes
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


    const renderSubjectFields = (subject, subjectIndex) => {
        const subjectAvg = calculateSubjectAvg(subject.notes);
        const semesterKey = activeSemester;
        
        return (
            <fieldset key={subject.matiere + subjectIndex}>
                <legend>{subject.matiere}</legend>
                <div className='section-overall'>Moyen : <b style={{ color: subjectAvg < 10 ? 'red' : 'green' }}>{format(subjectAvg)}</b></div>
                <fieldset>
                    {subject.notes.map((note, noteIndex) => (
                        <p key={`${subject.matiere}-${note.type}`}>
                            {note.type.toUpperCase()} <input 
                                type="number" 
                                min="0" 
                                max="20" 
                                step="0.25" 
                                value={note.note} 
                                onChange={(e) => handleChange(semesterKey, subjectIndex, noteIndex, e.target.value)} 
                            />
                        </p>
                    ))}
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
                        {/* File Upload Icon */}
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="17" x2="12" y2="11"></line>
                        <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                    <p className="empty-state-title">
                        Commencez ici : Téléchargez votre PDF
                    </p>
                    <p className="empty-state-instruction">
                        Veuillez utiliser le bouton "Upload PDF" ci-dessus pour charger vos données de notes. Une fois le fichier traité, vos matières et moyennes apparaîtront automatiquement.
                    </p>
                    <div className="empty-state-warning">
                        ⚠️ Note Importante : Cette fonctionnalité de filière personnalisée est en cours de test et peut contenir des erreurs de lecture.
                    </div>
                </div>
            )}


            <Credits />
        </div>
        </>
    );
};

export default DynamicClass;