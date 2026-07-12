import React, { useState } from 'react';

export default function ExercisesTab({
    exercises,
    newExercise,
    setNewExercise,
    handleCreateExercise,
    handleUpdateExercise,
    history = [], // Fed from App.jsx state,
    handleDeleteExercise
}) {
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const [newImageUrl, setNewImageUrl] = useState('');
    const [fullScreenImage, setFullScreenImage] = useState(null);

    // Filter global history for entries containing this specific exercise
    const getExerciseHistory = (exerciseId) => {
        console.log(history, 'history in getExerciseHistory')
        return history
            ?.filter(session => session.exercises && session.exercises[exerciseId])
            ?.map(session => ({
                date: session.date,
                planName: session.planName,
                sets: session.exercises[exerciseId]
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
    };

    // Handle Detail View Carousel navigation
    const handleNextImage = (imageUrls) => {
        setCarouselIndex((prev) => (prev + 1) % imageUrls.length);
    };

    const handlePrevImage = (imageUrls) => {
        setCarouselIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    console.log(exercises, 'exercises')

    // --- VIEW A: DETAIL HISTORY VIEW ---
    if (selectedExercise) {
        const exerciseHistory = getExerciseHistory(selectedExercise.id);
        const hasImages = selectedExercise.imageUrls && selectedExercise.imageUrls.length > 0;
        const currentImg = hasImages ? selectedExercise.imageUrls[carouselIndex] : "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600";

        return (
            <div className="space-y-5 animate-fadeIn">
                {/* Navigation Back Header */}
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <button
                        onClick={() => { setSelectedExercise(null); setCarouselIndex(0); }}
                        className="text-slate-600 hover:text-emerald-400 p-1 text-sm font-bold flex items-center gap-1"
                    >
                        <i className="fa-solid fa-arrow-left"></i> Back to Catalog
                    </button>
                </div>

                {/* Multi-Image Form Check Carousel */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
                    <div className="h-48 bg-slate-950 relative">
                        <img
                            src={currentImg}
                            alt={selectedExercise.name}
                            className="w-full h-full object-cover opacity-90 cursor-pointer"
                            onClick={() => setFullScreenImage(currentImg)}
                        />

                        {/* --- ADD THIS PIECE: DYNAMIC IMAGE DELETION ACTION TRASH CAN BIN BUTTON --- */}
                        {hasImages && selectedExercise.imageUrls.length > 0 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Remove this form check angle image from the exercise profile?")) {
                                        const updatedUrls = selectedExercise.imageUrls.filter((_, i) => i !== carouselIndex);
                                        const updatedExercise = {
                                            ...selectedExercise,
                                            imageUrls: updatedUrls
                                        };
                                        handleUpdateExercise(updatedExercise);
                                        setSelectedExercise(updatedExercise); // Dynamic state sync update
                                        setCarouselIndex(0); // Reset index safely to avoid boundary errors
                                    }
                                }}
                                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm text-white w-7 h-7 rounded-md flex items-center justify-center border border-red-600/30 shadow-xs text-xs transition z-10"
                                title="Delete Current Angle Image"
                            >
                                <i className="fa-solid fa-trash-can text-white">X</i>
                            </button>
                        )}

                        {hasImages && selectedExercise.imageUrls.length > 1 && (
                            <>
                                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-black text-emerald-400 border border-slate-700">
                                    Form Angle {carouselIndex + 1} of {selectedExercise.imageUrls.length}
                                </span>
                                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                    <button onClick={() => handlePrevImage(selectedExercise.imageUrls)} className="pointer-events-auto bg-slate-900/80 text-white w-7 h-7 rounded-full flex items-center justify-center border border-slate-700/50"><i className="fa-solid fa-chevron-left text-xs"></i></button>
                                    <button onClick={() => handleNextImage(selectedExercise.imageUrls)} className="pointer-events-auto bg-slate-900/80 text-white w-7 h-7 rounded-full flex items-center justify-center border border-slate-700/50"><i className="fa-solid fa-chevron-right text-xs"></i></button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="p-4">
                        <h2 className="text-xl font-black text-black" style={{ color: 'black' }}>
                            {selectedExercise.name}
                        </h2>
                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-1">
                            Metric Profile: {selectedExercise.metricType.replace('_', ' ')}
                        </p>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex gap-2">
                            <input
                                type="url"
                                placeholder="Paste alternative form check image URL..."
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!newImageUrl.trim()) return;
                                    const updatedExercise = {
                                        ...selectedExercise,
                                        imageUrls: [...(selectedExercise.imageUrls || []), newImageUrl.trim()]
                                    };
                                    handleUpdateExercise(updatedExercise);
                                    setSelectedExercise(updatedExercise); // Refresh details view context dynamically
                                    setNewImageUrl('');
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs transition shrink-0"
                            >
                                Add Image
                            </button>
                        </div>

                    </div>
                    {/* --- APPEND DYNAMIC FULL SCREEN MODAL LAYER OVERLAY --- */}
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

                {/* Chronological Performance Tracking Timeline */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider px-1">Performance Log History</h3>

                    {exerciseHistory.length > 0 ? (
                        <div className="space-y-3">
                            {exerciseHistory?.map((log, index) => (
                                <div key={index} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-md">
                                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-1.5">
                                        <span className="text-xs font-black text-black"><i className="fa-regular fa-calendar-check mr-1.5 text-emerald-400"></i>{log.date}</span>
                                        <span className="text-[10px] font-medium bg-slate-50 px-2 py-0.5 rounded text-slate-600 border border-slate-200">{log.planName}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1 text-center text-[9px] uppercase tracking-wider font-bold text-slate-500">
                                        <span>Set</span>
                                        <span>Target Metric Output</span>
                                    </div>

                                    <div className="space-y-1">
                                        {log.sets?.map((set, sIdx) => (
                                            <div key={sIdx} className="grid grid-cols-3 text-center items-center bg-slate-50/40 py-1 rounded border border-slate-100/60 text-xs">
                                                <span className="text-slate-600 font-bold">{sIdx + 1}</span>
                                                <span className="col-span-2 font-black text-emerald-400">
                                                    {selectedExercise.metricType === 'WEIGHT_REPS' && `${set.weight} kg x ${set.reps} reps`}
                                                    {selectedExercise.metricType === 'BODYWEIGHT_REPS' && `${set.reps} Bodyweight Reps`}
                                                    {selectedExercise.metricType === 'DURATION' && `${set.duration} Seconds Hold`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white/40 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                            <i className="fa-solid fa-chart-line text-lg block mb-1 text-slate-600"></i>
                            No completed historical stats logged for this movement profile yet.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW B: NEW EXERCISE CREATION FORM ---
    if (isAdding) {
        return (
            <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                        <h2 className=" font-bold text-black" style={{ color: 'black' }}>Catalog Exercise</h2>
                        <p className="text-[11px] text-slate-600">Add a global core definition placeholder</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(false)}
                        className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold"
                    >
                        Cancel
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Movement Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Bulgarian Split Squat"
                            value={newExercise.name}
                            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Execution Tracking Mode Profile</label>
                        <select
                            value={newExercise.metricType}
                            onChange={(e) => setNewExercise({ ...newExercise, metricType: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-emerald-500"
                        >
                            <option value="WEIGHT_REPS">Weight (KG System) + Repetition Tracks</option>
                            <option value="BODYWEIGHT_REPS">Pure Bodyweight Engine (No weights displayed)</option>
                            <option value="DURATION">Timed Static Hold Duration (Tracks Seconds)</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">Form Reference Links (Multi-Image URL Arrays)</label>
                        {newExercise.imageUrls?.map((url, index) => (
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
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                                />
                                {newExercise.imageUrls.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const filtered = newExercise.imageUrls.filter((_, i) => i !== index);
                                            setNewExercise({ ...newExercise, imageUrls: filtered });
                                        }}
                                        className="bg-slate-700 text-slate-600 px-2.5 rounded-xl text-xs"
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
                        onClick={() => { handleCreateExercise(); setIsAdding(false); }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-xs font-black py-2.5 rounded-xl transition shadow-md"
                    >
                        Commit Exercise Registry Entry
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW C: PRIMARY EXERCISE CATALOG LIST VIEW ---
    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                    <h2 className=" font-bold text-black text-left" style={{ color: 'black' }}>Exercise Catalog</h2>
                    <p className="text-[11px] text-slate-600">Select an item to view targets and historic log trends</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-900 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-md"
                >
                    <i className="fa-solid fa-plus text-[10px]"></i> New Entry
                </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
                {exercises?.map((ex) => {
                    const totalLogs = getExerciseHistory(ex.id).length;
                    return (
                        <div
                            key={ex.id}
                            onClick={() => { setSelectedExercise(ex); setCarouselIndex(0); }}
                            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3.5 cursor-pointer active:scale-[0.99] transition shadow-sm group"
                        >
                            {/* Fallback Image Loader area */}
                            <img
                                src={ex.imageUrls && ex.imageUrls[0] ? ex.imageUrls[0] : "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150"}
                                className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-200/50 shrink-0"
                                alt=""
                            />

                            <div className="flex-1 min-w-0">
                                <h3 className="font-extrabold capitalize text-left text-sm text-black truncate group-hover:text-emerald-400 transition">{ex.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">
                                        {ex.metricType.split('_')[0]}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        <i className="fa-solid fa-clock-rotate-left mr-1"></i>Logged {totalLogs} times
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stops the card from launching the detail view toggle
                                        handleDeleteExercise(ex.id);
                                    }}
                                    className="text-slate-400 hover:text-red-500 p-2 transition"
                                    title="Remove Exercise"
                                >
                                    <i className="fa-solid fa-trash-can text-xs bg-red-400 p-1 rounded text-white font-bold">Delete</i>
                                </button>
                                {/* <div className="text-slate-600 group-hover:text-emerald-500 transition text-xs pr-1">
                                    <i className="fa-solid fa-chevron-right">{'>'}</i>
                                </div> */}
                            </div>
                            <div className="text-slate-500 group-hover:text-emerald-400 transition text-xs pr-1">
                                <i className="fa-solid fa-chevron-right"></i>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}