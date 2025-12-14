// src/api/match-up/useDeleteMatchUp.ts

import api from "@/api/axios";
import toast from "react-hot-toast";

export const deleteMatchUp = async (
  gameId: string,
): Promise<{ id: string }> => {
  try {
    if (!gameId) {
      throw new Error("Game ID is required");
    }

    const res = await api.delete<{
      success: boolean;
      statusCode: number;
      data: { id: string };
    }>(`/api/game/game-list/match-up/${gameId}`);

    toast.success(`Game ID ${gameId} deleted successfully.`);
    return res.data.data;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete Match Up game";
    console.error("Gagal menghapus Match Up:", err);
    toast.error(errorMessage);
    throw err;
  }
};
