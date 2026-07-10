import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import DiaryTab from './DiaryTab';
import PlansTab from './PlansTab';
import ExercisesTab from './ExercisesTab';

// Initialize IndexedDB Storage Instance
localforage.config({ name: "FitTrackPWA", storeName: "workout_data" });

export default function App() {
  // Global Navigation State
  const [currentTab, setCurrentTab] = useState('diary'); // 'diary' | 'plans' | 'exercises'
  
  // Data State
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Active Workout Tracking States
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutMode, setWorkoutMode] = useState('card'); // 'card' | 'list'
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
  const [workoutProgress, setWorkoutProgress] = useState({});

  // Form States
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', metricType: 'WEIGHT_REPS', imageUrls: [''] });
  const [newPlan, setNewPlan] = useState({ name: '', selectedExs: [] });
  const [schedulerForm, setSchedulerForm] = useState({ date: new Date().toISOString().split('T')[0], planId: '' });

  // Sync with IndexedDB on Component Mount
  useEffect(() => {
    async function loadSavedData() {
      const savedExs = await localforage.getItem('exercises') || [
        { id: 'ex-1', name: 'Lateral Lunges', metricType: 'WEIGHT_REPS', imageUrls: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600'] },
        { id: 'ex-2', name: 'Plank Hold', metricType: 'DURATION', imageUrls: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'] },
        { id: 'ex-3', name: 'Bodyweight Pull-ups', metricType: 'BODYWEIGHT_REPS', imageUrls: ['https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600'] }
      ];
      const savedPlans = await localforage.getItem('plans') || [
        { id: 'plan-1', name: 'Calisthenics & Core Focus', exercises: [
          { exerciseId: 'ex-1', targetSets: 3, targetReps: 12, targetDuration: 0 },
          { exerciseId: 'ex-2', targetSets: 3, targetReps: 0, targetDuration: 60 }
        ]}
      ];
      const savedSchedule = await localforage.getItem('schedule') || { [new Date().toISOString().split('T')[0]]: 'plan-1' };

      setExercises(savedExs);
      setPlans(savedPlans);
      setSchedule(savedSchedule);
    }
    loadSavedData();
    
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist();
    }
  }, []);

  const saveData = async (key, data) => {
    await localforage.setItem(key, data);
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
    for(let i = 0; i < startObj.getDay(); i++) days.push(null);
    for(let day = 1; day <= endObj.getDate(); day++) {
      const dateString = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push(dateString);
    }
    return days;
  };

  const handleCreateExercise = () => {
    if (!newExercise.name) return;
    const cleanUrls = newExercise.imageUrls.filter(url => url.trim() !== '');
    const updated = [...exercises, { ...newExercise, id: `ex-${Date.now()}`, imageUrls: cleanUrls.length ? cleanUrls : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd'] }];
    setExercises(updated);
    saveData('exercises', updated);
    setNewExercise({ name: '', metricType: 'WEIGHT_REPS', imageUrls: [''] });
  };

  const handleAssignPlanToDate = () => {
    if (!schedulerForm.planId) return;
    const updated = { ...schedule, [schedulerForm.date]: schedulerForm.planId };
    setSchedule(updated);
    saveData('schedule', updated);
    alert(`Plan successfully bound to ${schedulerForm.date}`);
  };

  const startWorkoutSession = (plan) => {
    const defaultProgress = {};
    plan.exercises.forEach(config => {
      defaultProgress[config.exerciseId] = Array.from({ length: config.targetSets }, () => ({
        weight: 40,
        reps: config.targetReps,
        duration: config.targetDuration
      }));
    });
    setWorkoutProgress(defaultProgress);
    setActiveExerciseIndex(0);
    setIsWorkoutActive(true);
  };

  const activePlanId = schedule[selectedDate];
  const todayPlan = plans.find(p => p.id === activePlanId);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans pb-24 max-w-md mx-auto border-x border-slate-800">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 px-4 py-1 flex justify-between items-center">
        <h1 className="text-xl font-black text-emerald-400 tracking-tight">
          <i className="fa-solid fa-square-heart mr-2"></i>FitTrack Pro
        </h1>
        {/* <span className="text-[11px] font-mono font-bold bg-slate-900 px-2 py-1 rounded border border-slate-700 text-slate-400">
          Metric: KG (5kg Steps)
        </span> */}
      </header>

      <main className="p-4 space-y-6">
        {currentTab === 'diary' && (
          <DiaryTab
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            showFullCalendar={showFullCalendar}
            setShowFullCalendar={setShowFullCalendar}
            isWorkoutActive={isWorkoutActive}
            setIsWorkoutActive={setIsWorkoutActive}
            workoutMode={workoutMode}
            setWorkoutMode={setWorkoutMode}
            activeExerciseIndex={activeExerciseIndex}
            setActiveExerciseIndex={setActiveExerciseIndex}
            activeImageIndexes={activeImageIndexes}
            setActiveImageIndexes={setActiveImageIndexes}
            workoutProgress={workoutProgress}
            setWorkoutProgress={setWorkoutProgress}
            exercises={exercises}
            todayPlan={todayPlan}
            schedule={schedule}
            getMonthDaysMatrix={getMonthDaysMatrix}
            getRecentDates={getRecentDates}
            startWorkoutSession={startWorkoutSession}
          />
        )}

        {currentTab === 'plans' && (
          <PlansTab
            schedulerForm={schedulerForm}
            setSchedulerForm={setSchedulerForm}
            plans={plans}
            setPlans={setPlans}
            exercises={exercises}
            newPlan={newPlan}
            setNewPlan={setNewPlan}
            handleAssignPlanToDate={handleAssignPlanToDate}
            saveData={saveData}
          />
        )}

        {currentTab === 'exercises' && (
          <ExercisesTab
            newExercise={newExercise}
            setNewExercise={setNewExercise}
            handleCreateExercise={handleCreateExercise}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-4 py-2 flex justify-around items-center max-w-md mx-auto rounded-t-2xl shadow-2xl z-50">
        <button onClick={() => { setIsWorkoutActive(false); setCurrentTab('diary'); }} className={`flex flex-col items-center gap-1 transition ${currentTab === 'diary' ? 'text-emerald-400' : 'text-slate-400'}`}>
          <i className="fa-solid fa-calendar-day text-lg"></i>
          <span className="text-[10px] font-bold">Diary</span>
        </button>
        <button onClick={() => { setIsWorkoutActive(false); setCurrentTab('plans'); }} className={`flex flex-col items-center gap-1 transition ${currentTab === 'plans' ? 'text-emerald-400' : 'text-slate-400'}`}>
          <i className="fa-solid fa-sliders text-lg"></i>
          <span className="text-[10px] font-bold">Plans</span>
        </button>
        <button onClick={() => { setIsWorkoutActive(false); setCurrentTab('exercises'); }} className={`flex flex-col items-center gap-1 transition ${currentTab === 'exercises' ? 'text-emerald-400' : 'text-slate-400'}`}>
          <i className="fa-solid fa-dumbbell text-lg"></i>
          <span className="text-[10px] font-bold">Catalog</span>
        </button>
      </nav>
    </div>
  );
}