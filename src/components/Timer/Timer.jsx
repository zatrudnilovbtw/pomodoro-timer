import { useState, useEffect, useMemo, useRef } from "react";
import "./Timer.css";
import SettingsIcon from "/settings.png";

const { electron } = window;

const PomodoroTimer = () => {
  const [volume, setVolume] = useState(() => {
    const savedVolume = parseFloat(localStorage.getItem("volume"));
    return !isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 1 ? savedVolume : 0.5;
  });
  const [workTime, setWorkTime] = useState(() => {
    const savedWorkTime = parseInt(localStorage.getItem("workTime"));
    return !isNaN(savedWorkTime) && savedWorkTime > 0 ? savedWorkTime : 1500;
  });
  const [breakTime, setBreakTime] = useState(() => {
    const savedBreakTime = parseInt(localStorage.getItem("breakTime"));
    return !isNaN(savedBreakTime) && savedBreakTime > 0 ? savedBreakTime : 300;
  });
  const [mode, setMode] = useState("work");
  const initialTime = useMemo(() => (mode === "work" ? workTime : breakTime), [mode, workTime, breakTime]);
  const [seconds, setSeconds] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cycleCount, setCycleCount] = useState(() => {
    const savedCycles = parseInt(localStorage.getItem("cycleCount"));
    return !isNaN(savedCycles) && savedCycles >= 0 ? savedCycles : 0;
  });

  const endSound = useMemo(() => {
    const audio = new Audio("./end.mp3");
    audio.onerror = () => console.error("Ошибка загрузки end.mp3");
    return audio;
  }, []);

  const playClickSound = () => {
    const clickSound = new Audio("./click.mp3");
    clickSound.volume = volume;
    clickSound.play().catch((err) => console.error("Ошибка звука клика:", err));
  };

  const message = mode === "work" ? "Time to focus" : "Time to chill";
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      endSound.volume = volume;
      endSound.play().catch((err) => console.error("Ошибка воспроизведения звука:", err));
      if (electron?.sendNotification) {
        electron.sendNotification(
          "Pomodoro Timer",
          mode === "work" ? "Time for a break!" : "Back to work!"
        ).catch((err) => console.warn("Ошибка уведомления:", err));
      }
      if (mode === "work") {
        setMode("break");
        setSeconds(breakTime);
        setCycleCount((prev) => {
          const newCount = prev + 1;
          localStorage.setItem("cycleCount", newCount);
          return newCount;
        });
      } else {
        setMode("work");
        setSeconds(workTime);
      }
      setIsRunning(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds, mode, volume, workTime, breakTime]);

  const validateAndSetTime = (time, defaultTime) => {
    const minutes = parseInt(time / 60);
    return !isNaN(minutes) && minutes >= 1 ? time : defaultTime;
  };

  const handleSaveSettings = () => {
    const validatedWorkTime = validateAndSetTime(workTime, 1500);
    const validatedBreakTime = validateAndSetTime(breakTime, 300);
    setWorkTime(validatedWorkTime);
    setBreakTime(validatedBreakTime);
    localStorage.setItem("workTime", validatedWorkTime);
    localStorage.setItem("breakTime", validatedBreakTime);
    localStorage.setItem("volume", volume);
    if (!isRunning) {
      setSeconds(mode === "work" ? validatedWorkTime : validatedBreakTime);
    }
    setIsSettingsOpen(false);
  };

  const handleWorkTimeChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setWorkTime("");
    } else {
      const minutes = parseInt(value);
      if (!isNaN(minutes)) {
        setWorkTime(minutes * 60);
      }
    }
  };

  const handleBreakTimeChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setBreakTime("");
    } else {
      const minutes = parseInt(value);
      if (!isNaN(minutes)) {
        setBreakTime(minutes * 60);
      }
    }
  };

  const handleWorkTimeBlur = () => {
    if (workTime === "" || isNaN(workTime)) {
      setWorkTime(1500);
    } else if (workTime < 60) {
      setWorkTime(60);
    }
  };

  const handleBreakTimeBlur = () => {
    if (breakTime === "" || isNaN(breakTime)) {
      setBreakTime(300);
    } else if (breakTime < 60) {
      setBreakTime(60);
    }
  };

  const resetCycles = () => {
    setCycleCount(0);
    localStorage.setItem("cycleCount", 0);
    playClickSound();
  };

  const progress = useMemo(() => ((initialTime - seconds) / initialTime) * 100, [initialTime, seconds]);

  return (
    <div className="timer-container">
      <p className="message">{message}</p>
      <h1>Pomodoro Timer</h1>
      <div className="progress">
        <div className="progress-inner" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="timer">{`${Math.floor(seconds / 60)}:${(seconds % 60)
        .toString()
        .padStart(2, "0")}`}</p>
      <div className="button-group">
        <button className="button" onClick={() => { playClickSound(); setIsRunning(true); }}>
          Start
        </button>
        <button className="button" onClick={() => { playClickSound(); setIsRunning(false); }}>
          Stop
        </button>
        <button className="button" onClick={() => { playClickSound(); setSeconds(initialTime); setIsRunning(false); }}>
          Reset
        </button>
        <button className="settings-button" onClick={() => { playClickSound(); setIsSettingsOpen(true); }}>
          <img src={SettingsIcon} alt="Settings" />
        </button>
      </div>
      <div className="cycle-counter">
        <p>Completed Cycles: {cycleCount}</p>
        <button className="button-cycle" onClick={resetCycles}>
          Reset Cycles
        </button>
      </div>
      {isSettingsOpen && (
        <div className="modal" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Timer Settings</h2>
            <div className="settings-row">
              <label>Work Time (min):</label>
              <input
                type="number"
                value={workTime === "" ? "" : workTime / 60}
                onChange={handleWorkTimeChange}
                onBlur={handleWorkTimeBlur}
                min="1"
                step="1"
                className="settings-input"
              />
            </div>
            <div className="settings-row">
              <label>Break Time (min):</label>
              <input
                type="number"
                value={breakTime === "" ? "" : breakTime / 60}
                onChange={handleBreakTimeChange}
                onBlur={handleBreakTimeBlur}
                min="1"
                step="1"
                className="settings-input"
              />
            </div>
            <div className="settings-row">
              <label>Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
            </div>
            <div className="modal-buttons">
              <button className="save-button" onClick={handleSaveSettings}>
                Save
              </button>
              <button className="close-button" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;