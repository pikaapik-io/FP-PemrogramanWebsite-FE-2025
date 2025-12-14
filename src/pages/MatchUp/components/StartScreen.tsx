// src/pages/MatchUp/components/StartScreen.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import type { MatchUpGameData } from "@/api/match-up/useGetMatchUpGames"; // FIXED: Type-only import

interface StartScreenProps {
  gameData: MatchUpGameData;
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ gameData, onStart }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full text-center border border-gray-200">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">
          {gameData.name}
        </h1>
        <p className="text-gray-600 mb-6">{gameData.description}</p>

        {gameData.thumbnail_image && (
          <img
            src={gameData.thumbnail_image}
            alt="Game Thumbnail"
            className="mx-auto my-4 rounded-lg w-full h-40 object-cover border border-gray-300"
          />
        )}

        <div className="space-y-2 mt-4 text-left text-sm text-gray-500">
          <p>
            Status:{" "}
            <span
              className={`font-semibold ${gameData.is_published ? "text-green-600" : "text-red-600"}`}
            >
              {gameData.is_published ? "Published" : "Draft"}
            </span>
          </p>
          <p>
            Instructions: Click on a Term (Blue) and then its matching
            Definition (Green).
          </p>
          <p className="text-xs text-red-500 mt-4">
            Note: This game is time-based. The clock starts when you press
            Start.
          </p>
        </div>

        <Button
          onClick={onStart}
          className="mt-8 px-8 py-3 text-lg bg-indigo-600 hover:bg-indigo-700"
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default StartScreen;
