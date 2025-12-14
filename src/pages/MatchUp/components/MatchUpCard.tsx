// src/pages/MatchUp/components/MatchUpCard.tsx

import React from "react";
import type { MatchUpItem } from "@/api/match-up/useGetMatchUpGames"; // FIXED: Type-only import

interface MatchUpCardProps {
  /** Item (Key atau Value) yang akan ditampilkan */
  item: MatchUpItem;
  /** Jenis kartu: 'key' (Term) atau 'value' (Definition) */
  type: "key" | "value";
  /** Status apakah kartu sedang dipilih oleh user */
  isSelected: boolean;
  /** Status apakah kartu sudah berhasil dicocokkan */
  isMatched: boolean;
  /** Handler saat kartu diklik */
  onClick: () => void;
  /** Apakah board sedang dalam status pause (untuk menonaktifkan interaksi) */
  isBoardPaused: boolean;
}

/**
 * Komponen UI untuk menampilkan Term atau Definition dalam game Match Up.
 * Desain sederhana: menggunakan warna berbeda untuk Key vs Value.
 */
const MatchUpCard: React.FC<MatchUpCardProps> = ({
  item,
  type,
  isSelected,
  isMatched,
  onClick,
  isBoardPaused,
}) => {
  // Tentukan styling berdasarkan tipe dan status
  const baseClasses =
    "p-4 rounded-lg shadow-md text-sm font-semibold transition-all duration-200 h-24 w-full text-center flex items-center justify-center break-words";

  const typeClasses =
    type === "key"
      ? "bg-indigo-200 border-indigo-400 text-indigo-800" // Warna untuk Term
      : "bg-green-200 border-green-400 text-green-800"; // Warna untuk Definition

  const stateClasses = isMatched
    ? "opacity-30 cursor-default shadow-inner" // Sudah matched
    : isSelected
      ? "ring-4 ring-yellow-500 border-yellow-500 scale-105 shadow-xl hover:shadow-xl" // Sedang dipilih
      : "hover:shadow-lg hover:border-gray-500"; // Normal

  return (
    <button
      onClick={onClick}
      // Nonaktifkan jika sudah matched atau board sedang pause
      disabled={isMatched || isBoardPaused}
      className={`${baseClasses} ${typeClasses} ${stateClasses}`}
    >
      {item.text}
    </button>
  );
};

export default MatchUpCard;
