// src/pages/MatchUp/components/MatchUpBoard.tsx

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type {
  MatchUpGameData,
  MatchUpItem,
} from "@/api/match-up/useGetMatchUpGames";

interface MatchUpBoardProps {
  gameData: MatchUpGameData;
  isPaused: boolean;
  onGameComplete: () => void;
}

// Komponen Kartu Sederhana
const MatchUpCard: React.FC<{
  item: MatchUpItem;
  type: "key" | "value";
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
}> = ({ item, type, isSelected, isMatched, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isMatched}
      className={`
                p-4 rounded-lg shadow-md text-sm font-semibold transition-all duration-200 h-24 w-full text-center
                ${type === "key" ? "bg-indigo-200 border-indigo-400" : "bg-green-200 border-green-400"}
                ${isMatched ? "opacity-30 cursor-default shadow-inner" : "hover:shadow-lg"}
                ${isSelected && !isMatched ? "ring-4 ring-yellow-500 border-yellow-500 scale-105" : "border"}
            `}
    >
      {item.text}
    </button>
  );
};

const MatchUpBoard: React.FC<MatchUpBoardProps> = ({
  gameData,
  isPaused,
  onGameComplete,
}) => {
  const [selectedKey, setSelectedKey] = useState<MatchUpItem | null>(null);
  const [selectedValue, setSelectedValue] = useState<MatchUpItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);

  const totalPairs = gameData.keys.length;
  const isGameFinished = matchedIds.length === totalPairs;

  useEffect(() => {
    if (isGameFinished) {
      toast.success("All pairs matched! Game completed.", { duration: 1000 });
      setTimeout(onGameComplete, 1000);
    }
  }, [isGameFinished, onGameComplete]);

  // Logika Pencocokan
  useEffect(() => {
    if (selectedKey && selectedValue) {
      // Cek apakah ID dari Key dan Value sama (ID = index asli dari backend)
      if (selectedKey.id === selectedValue.id) {
        // Cocok!
        setMatchedIds((prev) => [...prev, selectedKey.id]);
        toast.success("Match!", { duration: 800 });
      } else {
        // Salah!
        toast.error("Mismatch. Try again.", { duration: 800 });
      }

      // Reset selection setelah cek
      const timer = setTimeout(() => {
        setSelectedKey(null);
        setSelectedValue(null);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedKey, selectedValue]);

  const handleCardClick = (item: MatchUpItem, type: "key" | "value") => {
    if (isPaused || isGameFinished) return;

    if (type === "key") {
      // Jika Key sama dengan yang sudah dipilih, deselect
      if (selectedKey?.id === item.id) {
        setSelectedKey(null);
        return;
      }
      setSelectedKey(item);
    } else {
      // type === 'value'
      // Jika Value sama dengan yang sudah dipilih, deselect
      if (selectedValue?.id === item.id) {
        setSelectedValue(null);
        return;
      }
      setSelectedValue(item);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-2xl relative"
      style={{ pointerEvents: isPaused || isGameFinished ? "none" : "auto" }}
    >
      <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Match Up Board ({matchedIds.length}/{totalPairs})
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Kolom Keys/Terms */}
        <div className="space-y-3 p-3 bg-indigo-50 rounded-lg">
          <h4 className="font-semibold text-indigo-800 text-lg mb-2">Terms</h4>
          {gameData.keys.map((item) => (
            <MatchUpCard
              key={`key-${item.id}`}
              item={item}
              type="key"
              isSelected={selectedKey?.id === item.id}
              isMatched={matchedIds.includes(item.id)}
              onClick={() => handleCardClick(item, "key")}
            />
          ))}
        </div>

        {/* Kolom Values/Definitions */}
        <div className="space-y-3 p-3 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 text-lg mb-2">
            Definitions
          </h4>
          {gameData.values.map((item) => (
            <MatchUpCard
              key={`value-${item.id}`}
              item={item}
              type="value"
              isSelected={selectedValue?.id === item.id}
              isMatched={matchedIds.includes(item.id)}
              onClick={() => handleCardClick(item, "value")}
            />
          ))}
        </div>
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-3xl font-bold rounded-xl">
          PAUSED
        </div>
      )}
    </div>
  );
};

export default MatchUpBoard;
