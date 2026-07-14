import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import DiaryTab from './DiaryTab';
import PlansTab from './PlansTab';
import ExercisesTab from './ExercisesTab';

localforage.config({ name: "FitTrackPWA", storeName: "workout_data" });

export default function App() {
  const [currentTab, setCurrentTab] = useState('diary');

  // Normalized App States
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Execution Control states
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutMode, setWorkoutMode] = useState('card');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
  const [workoutProgress, setWorkoutProgress] = useState({});

  // Sub-menu Form wrappers
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', metricType: 'WEIGHT_REPS', imageUrls: [''] });
  const [newPlan, setNewPlan] = useState({ name: '', selectedExs: [] });
  const [schedulerForm, setSchedulerForm] = useState({ date: new Date().toISOString().split('T')[0], planId: '' });

  // Correctly bound isolated async lifecycle synchronization hook
 // --- REPLACE YOUR CURRENT INITIALIZATION USEEFFECT HOOK WITH THIS ---
  useEffect(() => {
    async function loadSavedData() {
      try {
        const savedExs = await localforage.getItem('exercises') || [
          { id: 'ex-1', name: 'Lateral Lunges', metricType: 'WEIGHT_REPS', imageUrls: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600'] },
          { id: 'ex-2', name: 'Plank Hold', metricType: 'DURATION', imageUrls: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'] }
        ];
        const savedPlans = await localforage.getItem('plans') || [
          { id: 'plan-1', name: 'Calisthenics & Core Focus', selectedExs: [
            { exerciseId: 'ex-1', targetSets: 3, targetReps: 12, targetDuration: 0 },
            { exerciseId: 'ex-2', targetSets: 3, targetReps: 0, targetDuration: 60 }
          ]}
        ];
        const savedSchedule = await localforage.getItem('schedule') || { [new Date().toISOString().split('T')[0]]: 'plan-1' };
        const savedHistory = await localforage.getItem('history') || [];

        // Fetch ongoing session caches if they exist
        const sessionActive = await localforage.getItem('active_session_running') || false;
        const sessionIndex = await localforage.getItem('active_session_index') || 0;
        const sessionProgress = await localforage.getItem('active_session_progress') || {};

        setExercises(savedExs);
        setPlans(savedPlans);
        setSchedule(savedSchedule);
        setHistory(savedHistory);
        
        // Restore progress values smoothly
        setIsWorkoutActive(sessionActive);
        setActiveExerciseIndex(sessionIndex);
        setWorkoutProgress(sessionProgress);
      } catch (err) {
        console.error("IndexedDB bootstrap store fault:", err);
      }
    }
    loadSavedData();
  }, []);

  // --- ADD THIS NEW SIDE-EFFECT HANDLER DIRECTLY BELOW THE REGULAR LIFE-CYCLE USEEFFECT HOOK ---
  useEffect(() => {
    if (isWorkoutActive) {
      saveData('active_session_running', isWorkoutActive);
      saveData('active_session_index', activeExerciseIndex);
      saveData('active_session_progress', workoutProgress);
    }
  }, [isWorkoutActive, activeExerciseIndex, workoutProgress]);

  const saveData = async (key, data) => {
    await localforage.setItem(key, data);
  };


  const startWorkoutSession = (plan) => {
    const defaultProgress = {};
    plan?.selectedExs?.forEach(config => {
      defaultProgress[config.exerciseId] = Array.from({ length: parseInt(config.targetSets) || 3 }, () => ({
        weight: 0,
        reps: config.targetReps || 0,
        duration: config.targetDuration || 0
      }));
    });
    setWorkoutProgress(defaultProgress);
    setActiveExerciseIndex(0);
    setIsWorkoutActive(true);
    
    // Explicitly commit initial cache boundaries
    saveData('active_session_running', true);
    saveData('active_session_index', 0);
    saveData('active_session_progress', defaultProgress);
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm("Are you sure you want to delete this workout blueprint?")) {
      const updated = plans.filter(p => p.id !== planId);
      setPlans(updated);
      saveData('plans', updated);

      // Optional: Clean up the calendar schedule if it was assigned to dates
      const updatedSchedule = { ...schedule };
      Object.keys(updatedSchedule).forEach(date => {
        if (updatedSchedule[date] === planId) delete updatedSchedule[date];
      });
      setSchedule(updatedSchedule);
      saveData('schedule', updatedSchedule);
    }
  };

  const handleDeleteExercise = (exerciseId) => {
    if (window.confirm("Deleting this exercise will remove it from your catalog. Proceed?")) {
      const updated = exercises.filter(e => e.id !== exerciseId);
      setExercises(updated);
      saveData('exercises', updated);
    }
  };
  // NEW PIPELINE: Commits completed active records straight into history storage array maps
  
const handleFinishWorkout = (date, planName, progress) => {
    const cleanedHistory = history.filter(h => h.date !== date);
    const newEntry = {
      id: `hist-${Date.now()}`,
      date,
      planName,
      exercises: progress,
      isRestDay: false
    };
    const updated = [...cleanedHistory, newEntry];
    setHistory(updated);
    saveData('history', updated);
    setIsWorkoutActive(false);
    
    // Wipe ongoing session caches out completely
    localforage.removeItem('active_session_running');
    localforage.removeItem('active_session_index');
    localforage.removeItem('active_session_progress');
    
    alert('Workout successfully preserved to offline logs diary!');
  };

  // NEW PIPELINE: Flags date indices explicitly as rest intervals
  const handleMarkRestDay = (date) => {
    const cleanedHistory = history.filter(h => h.date !== date);
    const restEntry = {
      id: `rest-${Date.now()}`,
      date,
      planName: "Rest Day",
      exercises: {},
      isRestDay: true
    };
    const updated = [...cleanedHistory, restEntry];
    setHistory(updated);
    saveData('history', updated);
  };

  const handleUpdateExercise = (updatedEx) => {
    const updated = exercises.map(e => e.id === updatedEx.id ? updatedEx : e);
    setExercises(updated);
    saveData('exercises', updated);
  };

  // NEW PIPELINE: Drops completed performance payloads to re-enable standard execution states
 const handleClearDateHistory = (date) => {
    const updated = history.filter(h => h.date !== date);
    setHistory(updated);
    saveData('history', updated);
    
    // Safety check: if you clear history, make sure ongoing flags don't accidentally linger
    setIsWorkoutActive(false);
    localforage.removeItem('active_session_running');
    localforage.removeItem('active_session_index');
    localforage.removeItem('active_session_progress');
  };
  const handleCreateExercise = () => {
    if (!newExercise.name) return;
    const cleanUrls = newExercise.imageUrls.filter(url => url.trim() !== '');
    const updated = [...exercises, { ...newExercise, id: `ex-${Date.now()}`, imageUrls: cleanUrls.length ? cleanUrls : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600'] }];
    setExercises(updated);
    saveData('exercises', updated);
    setNewExercise({ name: '', metricType: 'WEIGHT_REPS', imageUrls: [''] });
  };

  const handleAssignPlanToDate = () => {
    if (!schedulerForm.planId) return;
    const updated = { ...schedule, [schedulerForm.date]: schedulerForm.planId };
    setSchedule(updated);
    saveData('schedule', updated);
    alert(`Blueprint assigned successfully.`);
  };

  const getRecentDates = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getMonthDaysMatrix = () => {
    const current = new Date(selectedDate);
    const startObj = new Date(current.getFullYear(), current.getMonth(), 1);
    const endObj = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < startObj.getDay(); i++) days.push(null);
    for (let day = 1; day <= endObj.getDate(); day++) {
      days.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
    return days;
  };

  const activePlanId = schedule[selectedDate];
  const todayPlan = plans.find(p => p.id === activePlanId);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen  w-full font-sans pb-24 max-w-md mx-auto border-x border-slate-100">
      <header className="h-[60px] bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl " style={{ color: 'black' }}><i className="fa-solid fa-square-heart mr-2"></i>FitTrack Pro</h1>
        <span className="text-[11px] font-mono font-bold bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-600 font-bold">KG System</span>
      </header>

      <main className="p-4 space-y-6 w-full">
        {currentTab === 'diary' && (
          <DiaryTab
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            showFullCalendar={showFullCalendar} setShowFullCalendar={setShowFullCalendar}
            isWorkoutActive={isWorkoutActive} setIsWorkoutActive={setIsWorkoutActive}
            workoutMode={workoutMode} setWorkoutMode={setWorkoutMode}
            activeExerciseIndex={activeExerciseIndex} setActiveExerciseIndex={setActiveExerciseIndex}
            activeImageIndexes={activeImageIndexes} setActiveImageIndexes={setActiveImageIndexes}
            workoutProgress={workoutProgress} setWorkoutProgress={setWorkoutProgress}
            exercises={exercises} todayPlan={todayPlan} schedule={schedule} history={history}
            getMonthDaysMatrix={getMonthDaysMatrix} getRecentDates={getRecentDates}
            startWorkoutSession={startWorkoutSession} handleFinishWorkout={handleFinishWorkout}
            handleMarkRestDay={handleMarkRestDay} handleClearDateHistory={handleClearDateHistory}
          />
        )}

        {currentTab === 'plans' && (
          <PlansTab
            schedulerForm={schedulerForm} setSchedulerForm={setSchedulerForm}
            plans={plans} setPlans={setPlans} exercises={exercises}
            newPlan={newPlan} setNewPlan={setNewPlan}
            handleAssignPlanToDate={handleAssignPlanToDate} saveData={saveData}
            handleDeletePlan={handleDeletePlan}
          />
        )}

        {currentTab === 'exercises' && (
          <ExercisesTab
            exercises={exercises} newExercise={newExercise}
            setNewExercise={setNewExercise} handleCreateExercise={handleCreateExercise}
            history={history}
            handleDeleteExercise={handleDeleteExercise}
            handleUpdateExercise={handleUpdateExercise}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 flex justify-around items-center max-w-md mx-auto rounded-t-2xl shadow-2xl z-50">
        <button onClick={() => { setIsWorkoutActive(false); setCurrentTab('diary'); }} className={`flex flex-col items-center gap-1 transition ${currentTab === 'diary' ? 'text-emerald-400' : 'text-slate-600'}`}>
          <i className="fa-solid fa-calendar-day text-lg"></i><span className="text-[10px] font-bold">Diary</span>
        </button>
        <button onClick={() => { setIsWorkoutActive(false); setCurrentTab('plans'); }} className={`flex flex-col items-center gap-1 transition ${currentTab === 'plans' ? 'text-emerald-400' : 'text-slate-600'}`}>
          <i className="fa-solid fa-sliders text-lg"></i><span className="text-[10px] font-bold">Plans</span>
        </button>
        <button onClick={() => { setIsWorkoutActive(false); setCurrentTab('exercises'); }} className={`flex flex-col items-center gap-1 transition ${currentTab === 'exercises' ? 'text-emerald-400' : 'text-slate-600'}`}>
          <i className="fa-solid fa-dumbbell text-lg"></i><span className="text-[10px] font-bold">Catalog</span>
        </button>
      </nav>
    </div>
  );
}