import React from 'react';

export default function PlansTab({
  schedulerForm,
  setSchedulerForm,
  plans,
  setPlans,
  exercises,
  newPlan,
  setNewPlan,
  handleAssignPlanToDate,
  saveData
}) {
  return (
    <div className="space-y-6">
      {/* SCHEDULER ENGINE PANEL */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider"><i className="fa-solid fa-calendar-plus mr-1"></i> Date Assignment Deck</h3>
          <p className="text-[11px] text-slate-600">Lock any previously created routine blueprint to a target tracking calendar date entry.</p>
        </div>
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Target Calendar Date</label>
              <input 
                type="date" 
                value={schedulerForm.date}
                onChange={(e) => setSchedulerForm({ ...schedulerForm, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Choose Existing Blueprint</label>
              <select 
                value={schedulerForm.planId}
                onChange={(e) => setSchedulerForm({ ...schedulerForm, planId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-black focus:outline-none"
              >
                <option value="">Select Blueprints...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <button 
            onClick={handleAssignPlanToDate}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-xs font-black py-2.5 rounded-xl transition"
          >
            Commit Routine Blueprint to Selected Calendar Date
          </button>
        </div>
      </section>

      {/* BLUEPRINT CREATION WIZARD ENGINE */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-black text-black uppercase tracking-wider">Assemble Routine Blueprint</h3>
          <p className="text-[11px] text-slate-600">Group base movements and assign custom unique execution targets.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Routine Title</label>
            <input 
              type="text" 
              placeholder="e.g., Push Day Vol.3"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-emerald-500" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Select Exercises & Map Target Metrics</label>
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {exercises.map(ex => {
                const selectedIndex = newPlan.selectedExs.findIndex(item => item.exerciseId === ex.id);
                const isChecked = selectedIndex > -1;

                const handleCheckboxToggle = () => {
                  if (isChecked) {
                    const filtered = newPlan.selectedExs.filter(item => item.exerciseId !== ex.id);
                    setNewPlan({ ...newPlan, selectedExs: filtered });
                  } else {
                    setNewPlan({ ...newPlan, selectedExs: [...newPlan.selectedExs, { exerciseId: ex.id, targetSets: 3, targetReps: 10, targetDuration: 45 }] });
                  }
                };

                return (
                  <div key={ex.id} className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={handleCheckboxToggle}
                        className="rounded border-slate-300 bg-slate-50 text-emerald-500" 
                      />
                      <span className="text-xs font-bold text-slate-800 capitalize">{ex.name}</span>
                    </div>

                    {isChecked && (
                      <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-lg text-center">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-500">Target Sets</label>
                          <input 
                            type="number" 
                            value={newPlan.selectedExs[selectedIndex].targetSets}
                            onChange={(e) => {
                              const update = [...newPlan.selectedExs];
                              update[selectedIndex].targetSets = parseInt(e.target.value) || 0;
                              setNewPlan({ ...newPlan, selectedExs: update });
                            }}
                            className="w-full bg-slate-50 rounded border border-slate-200 text-center text-xs font-bold text-black py-0.5" 
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-500">
                            {ex.metricType === 'DURATION' ? "Target Duration (s)" : "Target Reps"}
                          </label>
                          <input 
                            type="number" 
                            value={ex.metricType === 'DURATION' ? newPlan.selectedExs[selectedIndex].targetDuration : newPlan.selectedExs[selectedIndex].targetReps}
                            onChange={(e) => {
                              const update = [...newPlan.selectedExs];
                              if(ex.metricType === 'DURATION') {
                                update[selectedIndex].targetDuration = parseInt(e.target.value) || 0;
                              } else {
                                update[selectedIndex].targetReps = parseInt(e.target.value) || 0;
                              }
                              setNewPlan({ ...newPlan, selectedExs: update });
                            }}
                            className="w-full bg-slate-50 rounded border border-slate-200 text-center text-xs font-bold text-black py-0.5" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => {
              if(!newPlan.name || !newPlan.selectedExs.length) return;
              const updated = [...plans, { ...newPlan, id: `plan-${Date.now()}` }];
              setPlans(updated);
              saveData('plans', updated);
              setNewPlan({ name: '', selectedExs: [] });
              alert('Routine blueprint saved locally!');
            }}
            className="w-full bg-blue-500 text-black font-extrabold py-2.5 rounded-xl text-xs transition"
          >
            Save Complete Plan Blueprint
          </button>
        </div>
      </section>
    </div>
  );
}