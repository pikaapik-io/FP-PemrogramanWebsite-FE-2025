// src/api/match-up/useGetMatchUpGame.ts

import { useEffect, useState } from "react";
import api from "@/api/axios";

// ==================== TYPES ====================

export interface MatchUpItem {
  id: number;
  text: string;
}

export interface MatchUpGameData {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string;
  keys: MatchUpItem[];
  values: MatchUpItem[];
  is_published: boolean;
}

export interface MatchUpGameResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: MatchUpGameData;
}

// ==================== HOOK ====================

export const useGetMatchUpGame = (gameId: string) => {
  const [data, setData] = useState<MatchUpGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        // Menggunakan endpoint public untuk bermain
        const response = await api.get<MatchUpGameResponse>(
          `/api/game/game-list/match-up/${gameId}/play/public`,
        );

        setData(response.data.data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch Match Up game"),
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  return { data, loading, error };
};
