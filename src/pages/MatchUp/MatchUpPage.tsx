// src/pages/MatchUp/MatchUpPage.tsx

import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useGetMatchUpGame } from "@/api/match-up/useGetMatchUpGames";
import { useSaveMatchUpScore } from "@/api/match-up/useSaveScore";
// Asumsi Anda membuat komponen sederhana ini:
import MatchUpBoard from "./components/MatchUpBoard";
// Asumsi komponen ini berada di tempat yang benar atau Anda akan membuatnya:
import PauseDialog from "./components/PauseDialog";
import StartScreen from "./components/StartScreen";
import { Button } from "@/components/ui/button";

// --- Component ---
const Game = () => {
  const navigate = useNavigate();
  const { id: gameId } = useParams<{ id: string }>();
  const { data: gameData, loading, error } = useGetMatchUpGame(gameId || "");
  const saveScore = useSaveMatchUpScore;

  const [stage, setStage] = useState<"start" | "play" | "gameover">("start");
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    if (timerRunning && !isPaused && stage === "play") {
      interval = setInterval(() => {
        setTimeSpent((t) => t + 1);
      }, 1000) as unknown as number;
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, isPaused, stage]);

  const handleStart = () => {
    setStage("play");
    setTimerRunning(true);
    setIsPaused(false);
  };

  const handlePauseClick = useCallback(() => {
    setIsPaused(true);
    setShowPauseDialog(true);
    setTimerRunning(false);
  }, []);

  const handleResume = useCallback(() => {
    setShowPauseDialog(false);
    setIsPaused(false);
    setTimerRunning(true);
  }, []);

  const handleRestart = useCallback(() => {
    setShowPauseDialog(false);
    setIsPaused(false);
    setTimerRunning(false);
    setTimeSpent(0);
    setStage("start");
  }, []);

  // Wajib: Callback saat game selesai (semua terpecahkan)
  const handleGameComplete = async () => {
    setTimerRunning(false);

    // 1. Wajib: Kirim Play Count ke Backend (endpoint POST Score)
    if (gameId) {
      try {
        await saveScore(gameId, { timeSpentSeconds: timeSpent });
        toast.success("Game progress saved!", { duration: 2000 });
      } catch (e) {
        console.error("Failed to save play count/score:", e);
      }
    }

    // 2. Transisi ke Game Over / Summary Screen
    setStage("gameover");
  };

  // Wajib: Exit Button harus memposting play count dan mengarah ke Home Page
  const handleExitGame = () => {
    // Panggil handleGameComplete (yang memposting play count) sebelum navigasi
    handleGameComplete();
    navigate("/"); // Navigasi ke home page
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading Game...
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        Error: Failed to load game.
      </div>
    );
  }

  return (
    <>
      <div className="w-screen min-h-screen bg-gray-100">
        {/* Navbar Sederhana dengan Exit/Pause */}
        <nav className="p-4 bg-white shadow-md flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-bold text-indigo-700">{gameData.name}</h1>
          <div className="flex gap-2">
            <Button
              onClick={handlePauseClick}
              disabled={stage !== "play"}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
            {/* Wajib: Exit Button */}
            <Button
              variant="outline"
              onClick={handleExitGame}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Exit
            </Button>
          </div>
        </nav>

        <div className="p-8">
          {stage === "start" && (
            <StartScreen gameData={gameData} onStart={handleStart} />
          )}

          {stage === "play" && (
            <div className="relative">
              <div className="mb-4 text-center text-lg font-semibold">
                Time: {Math.floor(timeSpent / 60)}:
                {("0" + (timeSpent % 60)).slice(-2)}
              </div>
              {/* Main Game Board */}
              <MatchUpBoard
                gameData={gameData}
                isPaused={isPaused}
                onGameComplete={handleGameComplete}
              />
            </div>
          )}

          {stage === "gameover" && (
            <div className="text-center p-10 bg-white rounded-lg shadow-xl">
              <h1 className="text-3xl font-bold text-green-600 mb-4">
                Game Complete!
              </h1>
              <p className="text-gray-700">
                Time Taken: {Math.floor(timeSpent / 60)}:
                {("0" + (timeSpent % 60)).slice(-2)}
              </p>
              <Button
                onClick={handleRestart}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pause Dialog (Wajib ada jika game time-based) */}
      <PauseDialog
        isOpen={showPauseDialog}
        onClose={() => {
          setShowPauseDialog(false);
          setIsPaused(false);
          setTimerRunning(true);
        }}
        onResume={handleResume}
        onRestart={handleRestart}
      />
    </>
  );
};

export default Game;
