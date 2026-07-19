import React, { useState } from 'react';
import WorkoutLogCard from './WorkoutLogCard';
import dayjs from 'dayjs';

export default function DiaryTab({
    selectedDate,
    setSelectedDate,
    showFullCalendar,
    setShowFullCalendar,
    isWorkoutActive,
    setIsWorkoutActive,
    workoutMode,
    setWorkoutMode,
    activeExerciseIndex,
    setActiveExerciseIndex,
    activeImageIndexes,
    setActiveImageIndexes,
    workoutProgress,
    setWorkoutProgress,
    exercises,
    todayPlan,
    schedule,
    history,
    getMonthDaysMatrix,
    getRecentDates,
    startWorkoutSession,
    handleFinishWorkout,
    handleMarkRestDay,
    handleClearDateHistory
}) {
    // Local state to track which historical entry card is expanded to view full sets/reps
    const [expandedHistoryId, setExpandedHistoryId] = useState(null);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [fullScreenImage, setFullScreenImage] = useState(null);
    // Check if the currently selected date has an entry in history logs
    const dateHistoryEntry = history?.find(h => h.date === selectedDate);

    return (
        <div className="space-y-6">
            {/* Calendar Controls View */}
            <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xl space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-700">Workout Date Stream</h3>
                    <button
                        onClick={() => setShowFullCalendar(!showFullCalendar)}
                        className="text-xs text-emerald-400 font-bold hover:underline"
                    >
                        {showFullCalendar ? "Show Mini-Strip" : "Show Full Calendar"}
                    </button>
                </div>

                {/* View Variant A: Compact Date Strip */}
                {!showFullCalendar ? (
                    <div className="flex justify-between gap-1 overflow-x-auto no-scrollbar py-1">
                        {getRecentDates().map(dStr => {
                            const isSelected = dStr === selectedDate;
                            const dateObj = new Date(dStr);
                            const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                            const dayNum = dateObj.getDate();
                            const histEntry = history?.find(h => h.date === dStr);

                            return (
                                <button
                                    key={dStr}
                                    onClick={() => setSelectedDate(dStr)}
                                    className={`flex flex-col items-center p-2 rounded-xl text-center min-w-[42px] transition ${isSelected ? 'bg-emerald-500 text-slate-900 font-black scale-105 shadow-md' : 'bg-slate-50/50 text-slate-600'}`}
                                >
                                    <span className="text-[10px] uppercase opacity-70 font-bold">{dayLabel}</span>
                                    <span className="text-sm mt-0.5 font-bold">{dayNum}</span>
                                    {histEntry && (
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${histEntry.isRestDay ? 'bg-amber-400' : isSelected ? 'bg-slate-50' : 'bg-emerald-400'}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    /* View Variant B: Full Dynamic Month Grid View */
                    <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-200/50 space-y-2">
                        <div className="text-center font-bold text-xs text-white uppercase tracking-wider mb-2">
                            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {getMonthDaysMatrix().map((dStr, index) => {
                                if (!dStr) return <div key={`empty-${index}`} />;
                                const isSelected = dStr === selectedDate;
                                const histEntry = history?.find(h => h.date === dStr);
                                const dayNum = dStr.split('-')[2];

                                return (
                                    <button
                                        key={dStr}
                                        onClick={() => { setSelectedDate(dStr); setShowFullCalendar(false); }}
                                        className={`p-1.5 text-xs rounded-md font-bold transition relative ${isSelected ? 'bg-emerald-500 text-slate-900' : histEntry ? (histEntry.isRestDay ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white text-emerald-400 border border-emerald-500/30') : 'text-slate-600 hover:bg-white'}`}
                                    >
                                        {dayNum}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* Main Execution Board Engine */}
            {!isWorkoutActive ? (
                <div className="space-y-4">
                    {/* CASE 1: WORKOUT WAS ALREADY COMPLETED FOR THE SELECTED DATE */}
                    {dateHistoryEntry && !dateHistoryEntry.isRestDay && (
                        <div className="bg-white p-5 rounded-2xl border border-emerald-500/30 shadow-xl space-y-4">
                            <div className="text-center space-y-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xl mb-1">
                                    <i className="fa-solid fa-circle-check"></i>
                                </div>
                                <p className="text-xs text-emerald-400 uppercase tracking-widest font-black">Day Logged Complete</p>
                                <h2 className="text-xl font-black text-black" style={{ color: 'black' }}>
                                    {dateHistoryEntry.planName}
                                </h2>
                            </div>

                            {/* Collapsible Details Layout View */}
                            <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-200/50 space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">Performance Details Summary</p>
                                {Object.keys(dateHistoryEntry.exercises).map(exId => {
                                    const exDetails = exercises?.find(e => e.id === exId);
                                    const setsLogged = dateHistoryEntry.exercises[exId];
                                    return (
                                        <div key={exId} className="text-xs space-y-1">
                                            <p className="font-bold text-slate-800 capitalize">{exDetails?.name || "Unknown Exercise"}</p>
                                            <div className="grid grid-cols-2 gap-1 pl-2 text-[11px] text-slate-600">
                                                {setsLogged.map((set, sIdx) => (
                                                    <span key={sIdx} className="bg-white/60 px-2 py-0.5 rounded border border-slate-200/30">
                                                        Set {sIdx + 1}: {exDetails?.metricType === 'WEIGHT_REPS' && `${set.weight} kg x ${set.reps} reps`}
                                                        {exDetails?.metricType === 'BODYWEIGHT_REPS' && `${set.reps} reps`}
                                                        {exDetails?.metricType === 'DURATION' && `${set.duration} secs`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={() => handleClearDateHistory(selectedDate)}
                                    className="w-full bg-slate-200 hover:bg-red-950 hover:text-red-400 text-slate-700 text-xs font-bold py-2 rounded-xl transition border border-slate-300/40"
                                >
                                    Clear and Re-log
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CASE 2: DATE IS AN EXPLICITLY MARKED REST DAY */}
                    {dateHistoryEntry && dateHistoryEntry.isRestDay && (
                        <div className="bg-white p-6 rounded-2xl border border-amber-500/20 text-center space-y-4 shadow-xl">
                            <div>
                                <div className="text-2xl mb-1">🧘‍♂️</div>
                                <p className="text-xs text-amber-400 uppercase tracking-widest font-black">Rest & Recovery</p>
                                <h2 className="text-xl font-black text-black mt-0.5" style={{ color: 'black' }}>Muscles Rebuilding!</h2>
                                <p className="text-xs text-slate-600 mt-1">Growth happens outside of the weight room.</p>
                            </div>
                            <button
                                onClick={() => handleClearDateHistory(selectedDate)}
                                className="w-full bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-600 hover:text-white text-xs font-bold py-2 rounded-xl transition"
                            >
                                Change Status / Cancel Rest Day
                            </button>
                        </div>
                    )}

                    {/* CASE 3: NO LOGGED ACTIVITY RECORDED YET */}
                    {!dateHistoryEntry && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xl">
                            {todayPlan ? (
                                <>
                                    <div>
                                        <p className="text-xs text-emerald-400 uppercase tracking-widest font-black">Scheduled Target Routine</p>
                                        <h2 className="text-2xl font-black text-amber-500 mt-1" style={{ color: 'black' }}>{todayPlan?.name}</h2>
                                        <p className="text-xs text-slate-600 mt-1">{todayPlan?.selectedExs?.length || 0} Specialized Movements Configured</p>
                                    </div>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => startWorkoutSession(todayPlan)}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold py-3.5 rounded-xl shadow-lg transition"
                                        >
                                            Initialize Session Workout
                                        </button>
                                        <button
                                            onClick={() => handleMarkRestDay(selectedDate)}
                                            className="w-full bg-slate-50 border border-slate-200 hover:border-amber-500 text-amber-400 text-xs font-bold py-2 rounded-xl transition"
                                        >
                                            🧘 Mark as Rest Day
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 space-y-3">
                                    <div className="text-slate-600 text-sm">
                                        <i className="fa-solid fa-bed text-2xl block text-slate-600 mb-2"></i>
                                        No routines scheduled to this explicit date yet.
                                    </div>
                                    <div className="flex gap-2 max-w-xs mx-auto">
                                        <button
                                            onClick={() => handleMarkRestDay(selectedDate)}
                                            className="w-full bg-slate-50 border border-slate-200 text-amber-400 text-xs font-bold py-2 rounded-xl transition"
                                        >
                                            🧘 Mark as Rest Day
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CHRONOLOGICAL PREVIOUS HISTORY LOG LIST FEED VIEW */}
                    <section className="space-y-2 pt-2">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider px-1">Completed History Stream</h3>
                        <div className="space-y-2">
                            {history?.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((histItem) => {
                                const isExpanded = expandedHistoryId === histItem.id;
                                return (
                                    <div
                                        key={histItem.id}
                                        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition"
                                    >
                                        {/* Header Row Bar clickable to toggle expansion detail view */}
                                        <div
                                            onClick={() => setExpandedHistoryId(isExpanded ? null : histItem.id)}
                                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100 transition-all select-none duration-200"
                                        >
                                            {/* Left & Middle Section: Metadata and Title */}
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                                                {/* Date Label */}
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block min-w-[110px]">
                                                    {dayjs(histItem.date).format("dddd, MMM DD")}
                                                </span>

                                                {/* Plan Title */}
                                                <h4 className="font-bold text-sm text-slate-800 text-left flex-1">
                                                    {histItem.planName}
                                                </h4>
                                            </div>

                                            {/* Right Section: Status Badge & Chevron Trigger */}
                                            <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0">
                                                <span
                                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${histItem.isRestDay
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}
                                                >
                                                    {histItem.isRestDay ? "Rest Day" : "Completed"}
                                                </span>

                                                {/* Chevron Icon Container */}
                                                {!histItem.isRestDay && (
                                                    <div className="text-slate-400 w-5 h-5 flex items-center justify-center">
                                                        <i
                                                            className={`fa-solid fa-chevron-down transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-slate-700' : ''
                                                                }`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Detailed Expanded Metrics Table Panel */}
                                        {isExpanded && !histItem.isRestDay && (
                                            <div className="bg-slate-50/40 border-t border-slate-200/50 p-3 space-y-2 text-xs">
                                                {Object.keys(histItem.exercises).map(exId => {
                                                    const ex = exercises?.find(e => e.id === exId);
                                                    return (
                                                        <div key={exId} className="border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                                                            <span className="font-bold text-slate-700 block mb-1">{ex?.name}</span>
                                                            <div className="flex flex-wrap gap-1.5 pl-1">
                                                                {histItem.exercises[exId].map((set, sIdx) => (
                                                                    <span key={sIdx} className="bg-white text-[10px] text-slate-600 px-2 py-0.5 rounded border border-slate-200/40">
                                                                        S{sIdx + 1}: {ex?.metricType === 'WEIGHT_REPS' && `${set.weight}kg x ${set.reps}`}
                                                                        {ex?.metricType === 'BODYWEIGHT_REPS' && `${set.reps}r`}
                                                                        {ex?.metricType === 'DURATION' && `${set.duration}s`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {history?.length === 0 && (
                                <p className="text-center py-6 text-xs text-slate-600 italic">No completed historical records logged yet.</p>
                            )}
                        </div>
                    </section>
                </div>
            ) : (
                /* Active Logging Engine HUD */
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                        <div>
                            <h3 className="font-extrabold text-black text-sm capitalize" style={{ color: 'black' }}>
                                {todayPlan?.name}
                            </h3>
                            <p className="text-[10px] text-slate-600">Exercise {activeExerciseIndex + 1} of {todayPlan?.selectedExs?.length || 0}</p>
                        </div>
                        <div className="bg-slate-50 p-1 rounded-lg flex gap-1 border border-slate-200 shrink-0">
                            <button onClick={() => setWorkoutMode('card')} className={`px-2.5 py-1 rounded text-xs font-bold transition ${workoutMode === 'card' ? 'bg-emerald-500 text-slate-900' : 'text-slate-600'}`}>Card</button>
                            <button onClick={() => setWorkoutMode('list')} className={`px-2.5 py-1 rounded text-xs font-bold transition ${workoutMode === 'list' ? 'bg-emerald-500 text-slate-900' : 'text-slate-600'}`}>List</button>
                        </div>
                    </div>

                    {/* MODE DESIGNATION A: CAROUSEL CARD RUNNER */}
                    {workoutMode === 'card' && <WorkoutLogCard
                        todayPlan={todayPlan}
                        exercises={exercises}
                        activeImageIndexes={activeImageIndexes}
                        setActiveImageIndexes={setActiveImageIndexes}
                        workoutProgress={workoutProgress}
                        setWorkoutProgress={setWorkoutProgress}
                        setActiveExerciseIndex={setActiveExerciseIndex}
                        activeExerciseIndex={activeExerciseIndex}
                        fullScreenImage={fullScreenImage}
                        setFullScreenImage={setFullScreenImage}
                        handleFinishWorkout={handleFinishWorkout}
                        selectedDate={selectedDate}
                        history={history}

                    />}

                    {/* MODE DESIGNATION B: COMPACT LIST VIEW */}
                    {workoutMode === 'list' && (
                        <div className="space-y-2">
                            {todayPlan?.selectedExs?.map((config, index) => {
                                const ex = exercises?.find(e => e.id === config.exerciseId);
                                const isActive = index === activeExerciseIndex;
                                return (
                                    <div
                                        key={config.exerciseId}
                                        onClick={() => { setActiveExerciseIndex(index); setWorkoutMode('card'); }}
                                        className={`p-3 rounded-xl border flex gap-3 items-center cursor-pointer transition ${isActive ? 'bg-white border-emerald-500' : 'bg-white/60 border-slate-200 opacity-70'}`}
                                    >
                                        <img src={ex?.imageUrls[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-50" alt="" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-black capitalize" style={{ color: 'black' }}>{index + 1}. {ex?.name}</h4>
                                            <p className="text-xs text-slate-600">{config.targetSets} Sets Mapped Blueprint</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}