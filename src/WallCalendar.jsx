import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./WallCalendar.css";

const MONTH_IMAGES = {
    0: { url: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1200&q=80", label: "January — Alpine Silence" },
    1: { url: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1200&q=80", label: "February — Frozen Shore" },
    2: { url: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80", label: "March — Blossoming Fields" },
    3: { url: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1200&q=80", label: "April — Morning Light" },
    4: { url: "https://images.unsplash.com/photo-1520962922320-2038eebab146?w=1200&q=80", label: "May — Verdant Canopy" },
    5: { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80", label: "June — Coastal Calm" },
    6: { url: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80", label: "July — Desert Horizon" },
    7: { url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200&q=80", label: "August — Lakeside Dusk" },
    8: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80", label: "September — Golden Hour" },
    9: { url: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1200&q=80", label: "October — Autumn Forest" },
    10: { url: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1200&q=80", label: "November — Misty Peaks" },
    11: { url: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200&q=80", label: "December — Winter Glow" },
};

const MONTH_NAMES = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const HOLIDAYS = {
    "1-1": "New Year's Day",
    "1-26": "Republic Day",
    "8-15": "Independence Day",
    "10-2": "Gandhi Jayanti",
    "12-25": "Christmas",
};

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for MON start
}
function dateKey(y, m, d) { return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
function holidayKey(m, d) { return `${m + 1}-${d}`; }

const themes = {
    adventure: { accent: "#0ea5e9", accentDark: "#0369a1", accentLight: "#e0f2fe", text: "#0f172a", bg: "#f8fafc" },
    nature: { accent: "#16a34a", accentDark: "#15803d", accentLight: "#dcfce7", text: "#052e16", bg: "#f0fdf4" },
    sunset: { accent: "#e07a5f", accentDark: "#c1503a", accentLight: "#fdf0ec", text: "#2c1810", bg: "#fff7f5" },
    royal: { accent: "#7c3aed", accentDark: "#5b21b6", accentLight: "#ede9fe", text: "#1e0a3c", bg: "#f5f3ff" },
};

export default function WallCalendar() {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [rangeStart, setRangeStart] = useState(null);
    const [rangeEnd, setRangeEnd] = useState(null);
    const [hoverDate, setHoverDate] = useState(null);
    const [notes, setNotes] = useState({});
    const [noteInput, setNoteInput] = useState("");
    const [themeName, setThemeName] = useState("adventure");
    const [direction, setDirection] = useState(0);

    const theme = themes[themeName];
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const monthImg = MONTH_IMAGES[viewMonth];

    useEffect(() => {
        const savedNotes = localStorage.getItem("wall_cal_notes");
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        const savedTheme = localStorage.getItem("wall_cal_theme");
        if (savedTheme) setThemeName(savedTheme);
    }, []);

    useEffect(() => {
        localStorage.setItem("wall_cal_notes", JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem("wall_cal_theme", themeName);
    }, [themeName]);

    const activeNoteKey = rangeStart && rangeEnd ? `range-${rangeStart}_${rangeEnd}` : (rangeStart ? `range-${rangeStart}` : "general");

    useEffect(() => {
        setNoteInput(notes[activeNoteKey] || "");
    }, [activeNoteKey, notes]);

    const navigate = useCallback((dir) => {
        setDirection(dir === "next" ? 1 : -1);
        setViewMonth(prev => {
            let m = prev + (dir === "next" ? 1 : -1);
            if (m > 11) { setViewYear(y => y + 1); return 0; }
            if (m < 0) { setViewYear(y => y - 1); return 11; }
            return m;
        });
    }, []);

    const handleDayClick = (day) => {
        const dk = dateKey(viewYear, viewMonth, day);
        if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(dk);
            setRangeEnd(null);
        } else {
            if (dk < rangeStart) {
                setRangeEnd(rangeStart);
                setRangeStart(dk);
            } else {
                setRangeEnd(dk);
            }
        }
    };

    const handleDayDoubleClick = (day) => {
        const dk = dateKey(viewYear, viewMonth, day);
        setRangeStart(dk);
        setRangeEnd(dk);
        document.querySelector('.notes-input')?.focus();
    };

    const isToday = (day) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

    const getDayStatus = (day) => {
        const dk = dateKey(viewYear, viewMonth, day);
        const effectiveEnd = rangeEnd || (rangeStart && hoverDate && hoverDate > rangeStart ? hoverDate : null);
        if (dk === rangeStart) return "start";
        if (dk === rangeEnd || dk === effectiveEnd) return "end";
        if (rangeStart && effectiveEnd && dk > rangeStart && dk < effectiveEnd) return "between";
        return "none";
    };

    const handleNoteChange = (val) => {
        setNoteInput(val);
        setNotes(prev => ({ ...prev, [activeNoteKey]: val }));
    };

    const saveNote = () => {
        if (!noteInput.trim()) return;
        setNotes(prev => ({ ...prev, [activeNoteKey]: noteInput }));
        setNoteInput(""); // Clear the input after saving
    };

    const clearRange = () => {
        setRangeStart(null);
        setRangeEnd(null);
        setHoverDate(null);
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const variants = {
        enter: (direction) => ({
            y: direction > 0 ? 500 : -500,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            y: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            y: direction < 0 ? 500 : -500,
            opacity: 0,
        }),
    };

    const savedNoteKeys = Object.entries(notes)
        .filter(([k, v]) => v && v.trim())
        .sort((a, b) => b[0].localeCompare(a[0])); // Latest dates/entries first

    return (
        <div className="cal-root" style={{
            "--accent": theme.accent,
            "--accent-dark": theme.accentDark,
            "--accent-light": theme.accentLight,
            "--bg": theme.bg,
            "--text": theme.text
        }}>
            <div className="cal-container shadow-xl">
                {/* Binding Rings */}
                <div className="binding">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="ring-wrap">
                            <div className="ring" />
                        </div>
                    ))}
                </div>

                <div className="cal-body">
                    {/* Top Section: Hero Image */}
                    <div className="hero-section">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={viewMonth}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    y: { type: "spring", stiffness: 200, damping: 25 },
                                    opacity: { duration: 0.3 }
                                }}
                                className="hero-img-container"
                            >
                                <img className="hero-img" src={monthImg.url} alt={monthImg.label} />
                                <div className="hero-overlay">
                                    <div className="hero-info">
                                        <span className="hero-year-label">{viewYear}</span>
                                        <h1 className="hero-month-label">{MONTH_NAMES[viewMonth]}</h1>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Wavy Separator */}
                        <div className="separator">
                            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 64C1200 75 1320 85 1380 90.7L1440 96V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" fill="white" />
                            </svg>
                        </div>

                        <div className="nav-controls">
                            <button className="nav-ctrl-btn" onClick={() => navigate("prev")}>‹</button>
                            <button className="nav-ctrl-btn" onClick={() => navigate("next")}>›</button>
                        </div>
                    </div>

                    {/* Bottom Section: Grid & Notes */}
                    <div className="content-section">
                        <div className="notes-col">
                            <h3 className="section-title">Notes</h3>
                            <div className="notes-entry">
                                <textarea
                                    className="notes-input"
                                    value={noteInput}
                                    onChange={e => handleNoteChange(e.target.value)}
                                    placeholder="Record your thoughts here..."
                                />
                                <button className="save-btn" onClick={saveNote}>Save Note</button>
                            </div>
                            <div className="past-notes-container">
                                {savedNoteKeys.length > 0 && <h4 className="past-notes-title">Past Entries</h4>}
                                <div className="past-notes custom-scrollbar">
                                    {savedNoteKeys.map(([k, v]) => (
                                        <div key={k} className="note-card" onClick={() => setNoteInput(v)}>
                                            <span className="note-date">{k === "general" ? "General" : k.replace("range-", "").split("_")[0]}</span>
                                            <p className="note-preview">{v}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid-col">
                            <div className="theme-selector">
                                {Object.entries(themes).map(([name, t]) => (
                                    <button
                                        key={name}
                                        className={`theme-chip ${themeName === name ? "active" : ""}`}
                                        style={{ "--chip-color": t.accent }}
                                        onClick={() => setThemeName(name)}
                                    />
                                ))}
                            </div>

                            <div className="grid-header">
                                {DAY_NAMES.map((d, i) => (
                                    <div key={d} className={`grid-head-day ${i >= 5 ? "weekend" : ""}`}>{d}</div>
                                ))}
                            </div>

                            <div className="calendar-grid">
                                {cells.map((day, idx) => {
                                    if (!day) return <div key={`empty-${idx}`} className="grid-cell empty" />;
                                    const status = getDayStatus(day);
                                    const isWeekend = idx % 7 >= 5;
                                    const hk = holidayKey(viewMonth, day);
                                    const dk = dateKey(viewYear, viewMonth, day);
                                    const hasNote = notes[`range-${dk}`] || savedNoteKeys.some(([k]) => k.includes(dk));

                                    return (
                                        <motion.div
                                            key={dk}
                                            whileHover={{ y: -2 }}
                                            className={[
                                                "grid-cell",
                                                isToday(day) ? "today" : "",
                                                status === "start" ? "r-start" : "",
                                                status === "end" ? "r-end" : "",
                                                status === "between" ? "r-between" : "",
                                                isWeekend ? "weekend" : "",
                                                hasNote ? "has-n" : "",
                                            ].filter(Boolean).join(" ")}
                                            onClick={() => handleDayClick(day)}
                                            onDoubleClick={() => handleDayDoubleClick(day)}
                                            onMouseEnter={() => rangeStart && !rangeEnd && setHoverDate(dateKey(viewYear, viewMonth, day))}
                                            onMouseLeave={() => setHoverDate(null)}
                                            title={HOLIDAYS[hk] || ""}
                                        >
                                            {HOLIDAYS[hk] && <span className="h-dot" />}
                                            <span className="d-num">{day}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="range-footer">
                                {rangeStart ? (
                                    <div className="range-active">
                                        <span>{rangeStart} {rangeEnd ? `→ ${rangeEnd}` : "→ select end"}</span>
                                        <button className="clear-range" onClick={clearRange}>✕</button>
                                    </div>
                                ) : (
                                    <span className="range-hint">Click days to select a range</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
