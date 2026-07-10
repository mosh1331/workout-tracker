import React from 'react'

const WorkoutListView = ({ todayPlan, exercises, activeExerciseIndex, setActiveExerciseIndex, setWorkoutMode }) => {
    return (
        <div className="space-y-2">
            {todayPlan?.selectedExs?.map((config, index) => {
                const ex = exercises.find(e => e.id === config?.exerciseId);
                const isActive = index === activeExerciseIndex;
                return (
                    <div
                        key={config?.exerciseId}
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
    )
}

export default WorkoutListView