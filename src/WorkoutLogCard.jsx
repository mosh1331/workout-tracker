import React from 'react'

const WorkoutLogCard = ({ todayPlan, exercises, activeImageIndexes, setActiveImageIndexes, workoutProgress, setWorkoutProgress, activeExerciseIndex, fullScreenImage, setFullScreenImage, setActiveExerciseIndex, handleFinishWorkout, selectedDate ,history}) => {
    const currentConfig = todayPlan?.selectedExs?.[activeExerciseIndex];
    if (!currentConfig) return null;
    const exDetails = exercises?.find(e => e.id === currentConfig.exerciseId);
    if (!exDetails) return null;

    const carouselIndex = activeImageIndexes[exDetails.id] || 0;
    const currentImage = exDetails.imageUrls[carouselIndex] || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600";

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[460px]">
            <div>
                <div className="h-52 bg-slate-250 relative">
                    {/* <img src={currentImage} alt={exDetails?.name} className="w-full h-full object-cover opacity-90" /> */}
                    <img
                        src={currentImage}
                        alt={exDetails?.name}
                        className="w-full h-full object-cover opacity-90 cursor-pointer"
                        onClick={() => setFullScreenImage(currentImage)}
                    />
                    {exDetails.imageUrls.length > 1 && (
                        <>
                            <span className="absolute top-3 left-3 bg-slate-50/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-black text-emerald-400 border border-slate-200">
                                Form Angle {carouselIndex + 1} of {exDetails.imageUrls?.length}
                            </span>
                            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                <button onClick={() => setActiveImageIndexes({ ...activeImageIndexes, [exDetails.id]: (carouselIndex - 1 + exDetails.imageUrls.length) % exDetails.imageUrls.length })} className="pointer-events-auto bg-slate-50/80 text-white w-7 h-7 rounded-full flex items-center justify-center border border-slate-200/50"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                                <button onClick={() => setActiveImageIndexes({ ...activeImageIndexes, [exDetails.id]: (carouselIndex + 1) % exDetails.imageUrls.length })} className="pointer-events-auto bg-slate-50/80 text-white w-7 h-7 rounded-full flex items-center justify-center border border-slate-200/50"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 space-y-3">
                    <div>
                        <h4 className="text-xl font-black text-amber-500">{exDetails?.name}</h4>
                        <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Profile Mode: {exDetails.metricType.replace('_', ' ')}</p>
                    </div>

                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/50 space-y-2">
                        <div className="grid grid-cols-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Set</span><span>Target</span><span>Prev</span><span> Log</span>
                        </div>

                        {workoutProgress[exDetails.id]?.map((setData, sIdx) => {
                            const lastRecordedSession = history
                                .filter(h => !h.isRestDay && h.exercises && h.exercises[exDetails.id])
                                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                            const previousSetData = lastRecordedSession?.exercises?.[exDetails.id]?.[sIdx];

                            // Construct a scannable preview text string value descriptive of past metrics
                            let historicalMetricString = "None";
                            if (previousSetData) {
                                if (exDetails.metricType === 'WEIGHT_REPS') {
                                    historicalMetricString = `${previousSetData.weight}kg × ${previousSetData.reps}r`;
                                } else if (exDetails.metricType === 'BODYWEIGHT_REPS') {
                                    historicalMetricString = `${previousSetData.reps}r (BW)`;
                                } else if (exDetails.metricType === 'DURATION') {
                                    historicalMetricString = `${previousSetData.duration}s`;
                                }
                            }

                            return (
                                <div key={sIdx} className="relative grid grid-cols-4 items-center text-center py-1">
                                    <span className="text-xs text-slate-600 font-bold">{sIdx + 1}</span>
                                    <span className="text-xs font-semibold text-emerald-400">
                                        {exDetails.metricType === 'WEIGHT_REPS' && `${currentConfig.targetReps} Reps`}
                                        {exDetails.metricType === 'BODYWEIGHT_REPS' && `${currentConfig.targetReps} Reps`}
                                        {exDetails.metricType === 'DURATION' && `${currentConfig.targetDuration} Secs`}
                                    </span>
                                   <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1 py-0.5 rounded shadow-xs max-w-[65px] mx-auto truncate" title="Last performance on this exact set index">
                                        {historicalMetricString}
                                    </span>
                                    <div className="flex justify-center items-center gap-1">
                                        {exDetails.metricType === 'WEIGHT_REPS' && (
                                            <>
                                                <input
                                                    type="number"
                                                    step="5"
                                                    value={setData.weight === 0 ? "" : setData.weight}
                                                    placeholder="0"
                                                    onChange={(e) => {
                                                        const next = { ...workoutProgress };
                                                        next[exDetails.id][sIdx].weight = parseInt(e.target.value) || 0;
                                                        setWorkoutProgress(next);
                                                    }}
                                                    className="w-14 bg-white border border-slate-300 rounded text-center text-xs font-bold py-1 text-black focus:outline-none"
                                                />
                                                <span className="text-[10px] text-slate-500">kg</span>
                                            </>
                                        )}
                                        {exDetails.metricType === 'BODYWEIGHT_REPS' && (
                                            <input
                                                type="number"
                                                value={setData.reps === 0 ? "" : setData.reps}
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const next = { ...workoutProgress };
                                                    next[exDetails.id][sIdx].reps = parseInt(e.target.value) || 0;
                                                    setWorkoutProgress(next);
                                                }}
                                                className="w-16 bg-white border border-slate-300 rounded text-center text-xs font-bold py-1 text-black focus:outline-none"
                                            />
                                        )}
                                        {exDetails.metricType === 'DURATION' && (
                                            <input
                                                type="number"
                                                value={setData.duration === 0 ? "" : setData.duration}
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const next = { ...workoutProgress };
                                                    next[exDetails.id][sIdx].duration = parseInt(e.target.value) || 0;
                                                    setWorkoutProgress(next);
                                                }}
                                                className="w-16 bg-white border border-slate-300 rounded text-center text-xs font-bold py-1 text-black focus:outline-none"
                                            />
                                        )}
                                    </div>
                                     
                                </div>
                            )
                        }

                        )}
                    </div>
                </div>
                {fullScreenImage && (
                    <div
                        onClick={() => setFullScreenImage(null)}
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
                    >
                        <button
                            onClick={() => setFullScreenImage(null)}
                            className="absolute top-4 right-4 text-white text-lg bg-slate-900/40 w-8 h-8 rounded-full flex items-center justify-center border border-white/10"
                        >
                            ✕
                        </button>
                        <img
                            src={fullScreenImage}
                            alt="Full-screen view"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50/40 border-t border-slate-200/50 flex justify-between items-center">
                <button disabled={activeExerciseIndex === 0} onClick={() => setActiveExerciseIndex(p => p - 1)} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30">Prev</button>
                {activeExerciseIndex < todayPlan?.selectedExs?.length - 1 ? (
                    <button onClick={() => setActiveExerciseIndex(p => p + 1)} className="bg-emerald-500 text-slate-900 px-5 py-2 rounded-xl text-xs font-black shadow-md">Next Exercise</button>
                ) : (
                    <button
                        onClick={() => handleFinishWorkout(selectedDate, todayPlan?.name, workoutProgress)}
                        className="bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md"
                    >
                        Finish Workout Session
                    </button>
                )}
            </div>
        </div>
    );
}

export default WorkoutLogCard