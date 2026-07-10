import React from 'react';

export default function ExercisesTab({
  newExercise,
  setNewExercise,
  handleCreateExercise
}) {
  return (
    <div className="space-y-6">
      <section className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Catalog New Global Exercise</h3>
          <p className="text-[11px] text-slate-400">Establish execution metric logic profiling formats here.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Movement Name</label>
            <input 
              type="text" 
              placeholder="e.g., Bulgarian Split Squat"
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Execution Tracking Mode Profile</label>
            <select 
              value={newExercise.metricType}
              onChange={(e) => setNewExercise({ ...newExercise, metricType: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
            >
              <option value="WEIGHT_REPS">Weight (KG System) + Repetition Tracks</option>
              <option value="BODYWEIGHT_REPS">Pure Bodyweight Engine (No weights displayed)</option>
              <option value="DURATION">Timed Static Hold Duration (Tracks Seconds)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Form Reference Links (Multi-Image URL Arrays)</label>
            {newExercise.imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="url" 
                  value={url}
                  placeholder="Paste image web hosting URL reference address here..."
                  onChange={(e) => {
                    const nextUrls = [...newExercise.imageUrls];
                    nextUrls[index] = e.target.value;
                    setNewExercise({ ...newExercise, imageUrls: nextUrls });
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none" 
                />
                {newExercise.imageUrls.length > 1 && (
                  <button 
                    onClick={() => {
                      const filtered = newExercise.imageUrls.filter((_, i) => i !== index);
                      setNewExercise({ ...newExercise, imageUrls: filtered });
                    }}
                    className="bg-slate-700 text-slate-400 px-2.5 rounded-xl text-xs"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => setNewExercise({ ...newExercise, imageUrls: [...newExercise.imageUrls, ''] })}
              className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1 pt-0.5"
            >
              <i className="fa-solid fa-circle-plus"></i> Add Next Form Carousel URL Node
            </button>
          </div>

          <button 
            onClick={handleCreateExercise}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-xs font-black py-2.5 rounded-xl transition shadow-md"
          >
            Commit Exercise Registry Entry
          </button>
        </div>
      </section>
    </div>
  );
}