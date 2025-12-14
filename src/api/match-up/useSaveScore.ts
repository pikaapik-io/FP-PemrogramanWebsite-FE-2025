// src/api/match-up/useSaveScore.ts

import api from "@/api/axios";

export interface SaveScorePayload {
  timeSpentSeconds?: number;
  finalScore?: number;
}

interface SaveScoreResponse {
  success: boolean;
  statusCode: number;
  data: {
    game_id: string;
    message: string;
    total_played: number;
  };
}

/**
 * Submit score/time and increment play count for Match Up game.
 * Uses the POST Score endpoint.
 */
export const useSaveMatchUpScore = async (
  gameId: string,
  payload: SaveScorePayload,
): Promise<SaveScoreResponse> => {
  try {
    if (!gameId) {
      throw new Error("Game ID is required");
    }

    const res = await api.post<SaveScoreResponse>(
      `/api/game/game-list/match-up/${gameId}/score`,
      {
        time_spent_seconds: payload.timeSpentSeconds, // Sesuai BE
        final_score: payload.finalScore,
      },
    );

    return res.data;
  } catch (err: unknown) {
    console.error("Failed to save score:", err);
    throw err;
  }
};
