import api from "@/api/axios";
// import toast from "react-hot-toast"; // 🛑 FIX 1: Dihapus karena tidak digunakan

import type { MatchUpPayload, MatchUpPair } from "./useCreateMatchUp";
import toast from "react-hot-toast"; // Diperlukan untuk error handling di akhir

// ==================== TYPES ====================

export type MatchUpUpdatePayload = Partial<
  Omit<MatchUpPayload, "pairs" | "thumbnailImage">
> & {
  pairs?: MatchUpPair[];
  thumbnailImage?: File;
  isPublish?: boolean;
};

interface GetMatchUpResponse {
  success: boolean;
  statusCode: number;
  data: unknown; // 🛑 FIX 2: Ganti 'any' dengan 'unknown'
}

// ==================== HOOK ====================

export const useUpdateMatchUp = async (
  gameId: string,
  updates: MatchUpUpdatePayload,
  // 🛑 FIX 3: Ganti 'any' dengan 'unknown'
): Promise<unknown> => {
  try {
    if (!gameId) {
      throw new Error("Game ID is required");
    }

    const formData = new FormData();

    if (updates.name) formData.append("name", updates.name);
    if (updates.description)
      formData.append("description", updates.description);
    if (updates.thumbnailImage)
      formData.append("thumbnail_image", updates.thumbnailImage);
    if (updates.isPublish !== undefined)
      formData.append("is_publish", String(updates.isPublish));

    if (updates.pairs) {
      const pairsPayload = updates.pairs.map((p) => ({
        key_text: p.keyText,
        value_text: p.valueText,
      }));
      formData.append("pairs", JSON.stringify(pairsPayload));
    }

    const res = await api.patch<GetMatchUpResponse>(
      `/api/game/game-list/match-up/${gameId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res.data.data;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update Match Up game";
    console.error("Gagal memperbarui Match Up:", err);
    toast.error(errorMessage);
    throw err;
  }
};
