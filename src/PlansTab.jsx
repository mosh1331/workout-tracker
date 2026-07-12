import React, { useState } from 'react';

export default function PlansTab({
    schedulerForm,
    setSchedulerForm,
    plans,
    setPlans,
    exercises,
    newPlan,
    setNewPlan,
    handleAssignPlanToDate,
    saveData,
    handleDeletePlan
}) {

    // --- ADD STATE HOOKS AT THE TOP OF THE COMPONENT BODY ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedPopupPlanId, setExpandedPopupPlanId] = useState(null);
    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-black py-3 rounded-xl border border-slate-200 shadow-sm transition flex items-center justify-center gap-2 mb-4"
            >
                <i className="fa-solid fa-folder-open text-emerald-600"></i> Inspect Existing Workout Plans Blueprint
            </button>
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
                                                            if (ex.metricType === 'DURATION') {
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
                            if (!newPlan.name || !newPlan.selectedExs.length) return;
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
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-4 flex flex-col max-h-[75vh] shadow-xl">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-3">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Blueprints Matrix</h3>
                                <p className="text-[10px] text-slate-500 font-medium">Click on any blueprint routine to reveal movement targets</p>
                            </div>
                            <button
                                onClick={() => { setIsModalOpen(false); setExpandedPopupPlanId(null); }}
                                className="text-slate-400 hover:text-slate-600 text-sm p-1 font-bold transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Scrollable Contents */}
                        <div className="overflow-y-auto no-scrollbar space-y-2 flex-1 pr-0.5">
                            {plans.map(p => {
                                const isExpanded = expandedPopupPlanId === p.id;
                                return (
                                    <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 transition">

                                        {/* Plan Row Bar toggler */}
                                        <div
                                            onClick={() => setExpandedPopupPlanId(isExpanded ? null : p.id)}
                                            className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition select-none"
                                        >
                                            <span className="font-extrabold text-xs text-slate-800 truncate pr-2">{p.name}</span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[9px] font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                                    {p.selectedExs?.length || 0} Ex
                                                </span>
                                                <i className={`fa-solid ${isExpanded ? 'fa-chevron-up text-emerald-600' : 'fa-chevron-down text-slate-400'} text-[10px]`}></i>
                                            </div>
                                        </div>

                                        {/* Mapped Inner Exercises Sub-List Dropdown */}
                                        {isExpanded && (
                                            <div className="bg-white border-t border-slate-200 p-2.5 space-y-1.5 text-[11px] text-slate-600 animate-slideDown">
                                                {p.selectedExs?.map((config, index) => {
                                                    const ex = exercises.find(e => e.id === config.exerciseId);
                                                    return (
                                                        <div key={config.exerciseId} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                                                            <span className="font-bold text-slate-700 truncate pr-2 capitalize">
                                                                {index + 1}. {ex?.name || "Deleted Exercise"}
                                                            </span>
                                                            <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 text-slate-500 font-mono font-bold shrink-0">
                                                                {ex?.metricType === 'DURATION'
                                                                    ? `${config.targetDuration}s`
                                                                    : `${config.targetSets}s × ${config.targetReps}r`}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                {(!p.selectedExs || p.selectedExs.length === 0) && (
                                                    <p className="text-slate-400 italic text-center text-[10px] py-1">No movement entries configured in this routine setup.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {plans.length === 0 && (
                                <p className="text-center py-8 text-xs text-slate-500 italic">No plans created yet in catalog storage pipelines.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// --- APPEND THIS MODAL CODE BLOB JUST BEFORE THE COMPONENT'S FINAL CLOSING </DIV> TAG ---
