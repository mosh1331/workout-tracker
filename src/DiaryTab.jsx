import React from 'react';

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
  getMonthDaysMatrix,
  getRecentDates,
  startWorkoutSession
}) {
  return (
    <div className="space-y-6">
      {/* Calendar Controls View */}
      <section className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-300">Workout Date Stream</h3>
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
              const hasPlan = !!schedule[dStr];

              return (
                <button 
                  key={dStr} 
                  onClick={() => setSelectedDate(dStr)}
                  className={`flex flex-col items-center p-2 rounded-xl text-center min-w-[42px] transition ${isSelected ? 'bg-emerald-500 text-slate-900 font-black scale-105 shadow-md' : 'bg-slate-900/50 text-slate-400'}`}
                >
                  <span className="text-[10px] uppercase opacity-70 font-bold">{dayLabel}</span>
                  <span className="text-sm mt-0.5 font-bold">{dayNum}</span>
                  {hasPlan && <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-slate-900' : 'bg-emerald-400'}`} />}
                </button>
              );
            })}
          </div>
        ) : (
          /* View Variant B: Full Dynamic Month Grid View */
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 space-y-2">
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
                const hasPlan = !!schedule[dStr];
                const dayNum = dStr.split('-')[2];

                return (
                  <button
                    key={dStr}
                    onClick={() => { setSelectedDate(dStr); setShowFullCalendar(false); }}
                    className={`p-1.5 text-xs rounded-md font-bold transition ${isSelected ? 'bg-emerald-500 text-slate-900' : hasPlan ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
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
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-4 shadow-xl">
          {todayPlan ? (
            <>
              <div>
                <p className="text-xs text-emerald-400 uppercase tracking-widest font-black">Scheduled Target Routine</p>
                <h2 className="text-2xl font-black text-white mt-1">{todayPlan.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{todayPlan.exercises.length} Specialized Movements Configured</p>
              </div>
              <button 
                onClick={() => startWorkoutSession(todayPlan)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold py-3.5 rounded-xl shadow-lg transition"
              >
                Initialize Session Workout
              </button>
            </>
          ) : (
            <div className="py-4 text-slate-400 text-sm">
              <i className="fa-solid fa-bed text-2xl block text-slate-600 mb-2"></i>
              No routines scheduled to this explicit date yet.<br/>
              <span className="text-xs text-slate-500">Go to the 'Plans' panel to map out a routine blueprint.</span>
            </div>
          )}
        </div>
      ) : (
        /* Active Logging Engine HUD */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
            <div>
              <h3 className="font-extrabold text-white text-sm">{todayPlan.name}</h3>
              <p className="text-[10px] text-slate-400">Exercise {activeExerciseIndex + 1} of {todayPlan.exercises.length}</p>
            </div>
            <div className="bg-slate-900 p-1 rounded-lg flex gap-1 border border-slate-700 shrink-0">
              <button 
                onClick={() => setWorkoutMode('card')} 
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${workoutMode === 'card' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400'}`}
              >
                Card
              </button>
              <button 
                onClick={() => setWorkoutMode('list')} 
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${workoutMode === 'list' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400'}`}
              >
                List
              </button>
            </div>
          </div>

          {/* MODE DESIGNATION A: CAROUSEL CARD RUNNER */}
          {workoutMode === 'card' && (() => {
            const currentConfig = todayPlan.exercises[activeExerciseIndex];
            const exDetails = exercises.find(e => e.id === currentConfig.exerciseId);
            if (!exDetails) return null;

            const carouselIndex = activeImageIndexes[exDetails.id] || 0;
            const currentImage = exDetails.imageUrls[carouselIndex] || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600";

            const handlePrevImage = (e) => {
              e.stopPropagation();
              setActiveImageIndexes({ ...activeImageIndexes, [exDetails.id]: (carouselIndex - 1 + exDetails.imageUrls.length) % exDetails.imageUrls.length });
            };

            const handleNextImage = (e) => {
              e.stopPropagation();
              setActiveImageIndexes({ ...activeImageIndexes, [exDetails.id]: (carouselIndex + 1) % exDetails.imageUrls.length });
            };

            return (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[460px]">
                <div>
                  {/* Sub-Carousel Multi Angle Form Preview Panel */}
                  <div className="h-52 bg-slate-950 relative">
                    <img src={currentImage} alt={exDetails.name} className="w-full h-full object-cover opacity-90" />
                    
                    {exDetails.imageUrls.length > 1 && (
                      <>
                        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-black text-emerald-400 border border-slate-700">
                          Form Angle {carouselIndex + 1} of {exDetails.imageUrls.length}
                        </span>
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                          <button onClick={handlePrevImage} className="pointer-events-auto bg-slate-900/80 text-white w-7 h-7 rounded-full flex items-center justify-center border border-slate-700/50"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                          <button onClick={handleNextImage} className="pointer-events-auto bg-slate-900/80 text-white w-7 h-7 rounded-full flex items-center justify-center border border-slate-700/50"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Exercise Metrics Log Inputs */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-xl font-black text-white">{exDetails.name}</h4>
                      <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Profile Mode: {exDetails.metricType}</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 space-y-2">
                      <div className="grid grid-cols-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Set</span><span>Target Goal</span><span>Your Tracker Input</span>
                      </div>

                      {workoutProgress[exDetails.id]?.map((setData, sIdx) => (
                        <div key={sIdx} className="grid grid-cols-3 items-center text-center py-1">
                          <span className="text-xs text-slate-400 font-bold">{sIdx + 1}</span>
                          
                          <span className="text-xs font-semibold text-emerald-400">
                            {exDetails.metricType === 'WEIGHT_REPS' && `${currentConfig.targetReps} Reps`}
                            {exDetails.metricType === 'BODYWEIGHT_REPS' && `${currentConfig.targetReps} Reps (BW)`}
                            {exDetails.metricType === 'DURATION' && `${currentConfig.targetDuration} Secs`}
                          </span>

                          <div className="flex justify-center items-center gap-1">
                            {exDetails.metricType === 'WEIGHT_REPS' && (
                              <>
                                <input 
                                  type="number" 
                                  step="5" 
                                  value={setData.weight}
                                  onChange={(e) => {
                                    const next = {...workoutProgress};
                                    next[exDetails.id][sIdx].weight = parseInt(e.target.value) || 0;
                                    setWorkoutProgress(next);
                                  }}
                                  className="w-14 bg-slate-800 border border-slate-600 rounded text-center text-xs font-bold py-1 text-white focus:outline-none" 
                                />
                                <span className="text-[10px] text-slate-500">kg</span>
                              </>
                            )}
                            {exDetails.metricType === 'BODYWEIGHT_REPS' && (
                              <input 
                                type="number" 
                                value={setData.reps}
                                onChange={(e) => {
                                  const next = {...workoutProgress};
                                  next[exDetails.id][sIdx].reps = parseInt(e.target.value) || 0;
                                  setWorkoutProgress(next);
                                }}
                                className="w-16 bg-slate-800 border border-slate-600 rounded text-center text-xs font-bold py-1 text-white focus:outline-none" 
                              />
                            )}
                            {exDetails.metricType === 'DURATION' && (
                              <input 
                                type="number" 
                                value={setData.duration}
                                onChange={(e) => {
                                  const next = {...workoutProgress};
                                  next[exDetails.id][sIdx].duration = parseInt(e.target.value) || 0;
                                  setWorkoutProgress(next);
                                }}
                                className="w-16 bg-slate-800 border border-slate-600 rounded text-center text-xs font-bold py-1 text-white focus:outline-none" 
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 flex justify-between items-center">
                  <button 
                    disabled={activeExerciseIndex === 0}
                    onClick={() => setActiveExerciseIndex(p => p - 1)}
                    className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
                  >
                    Prev
                  </button>
                  {activeExerciseIndex < todayPlan.exercises.length - 1 ? (
                    <button 
                      onClick={() => setActiveExerciseIndex(p => p + 1)}
                      className="bg-emerald-500 text-slate-900 px-5 py-2 rounded-xl text-xs font-black shadow-md"
                    >
                      Next Exercise
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setIsWorkoutActive(false); alert('Workout logged completely to history record stores!'); }}
                      className="bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md"
                    >
                      Finish Workout Session
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* MODE DESIGNATION B: COMPACT OVERVIEW LIST RUNNER */}
          {workoutMode === 'list' && (
            <div className="space-y-2">
              {todayPlan.exercises.map((config, index) => {
                const ex = exercises.find(e => e.id === config.exerciseId);
                const isActive = index === activeExerciseIndex;
                return (
                  <div 
                    key={config.exerciseId}
                    onClick={() => { setActiveExerciseIndex(index); setWorkoutMode('card'); }}
                    className={`p-3 rounded-xl border flex gap-3 items-center cursor-pointer transition ${isActive ? 'bg-slate-800 border-emerald-500' : 'bg-slate-800/60 border-slate-700 opacity-70'}`}
                  >
                    <img src={ex?.imageUrls[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-900" alt="" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white">{index + 1}. {ex?.name}</h4>
                      <p className="text-xs text-slate-400">
                        {config.targetSets} Sets Configuration Target
                      </p>
                    </div>
                    {isActive && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>}
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