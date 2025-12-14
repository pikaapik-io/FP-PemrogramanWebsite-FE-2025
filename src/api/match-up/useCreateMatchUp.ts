// src/api/match-up/useCreateMatchUp.ts

import api from "@/api/axios";
import toast from "react-hot-toast";

export interface MatchUpPair {
  keyText: string;
  valueText: string;
}

export interface MatchUpPayload {
  name: string;
  description: string;
  thumbnailImage: File;
  isPublishImmediately?: boolean; // Sesuai Settings di form
  pairs: MatchUpPair[];
}

interface CreateMatchUpPair {
  key_text: string;
  value_text: string;
}

interface CreateMatchUpResponse {
  success: boolean;
  statusCode: number;
  data: {
    id: string;
  };
}

export const createMatchUp = async (
  payload: MatchUpPayload,
): Promise<CreateMatchUpResponse> => {
  try {
    // Basic Validation (sesuai BE/Schema)
    if (!payload.name || payload.name.length > 128) {
      throw new Error("Name is required (max 128 chars)");
    }
    if (!payload.description || payload.description.length > 256) {
      throw new Error("Description is required (max 256 chars)");
    }
    if (payload.pairs.length < 3 || payload.pairs.length > 20) {
      throw new Error("Word Pairs must have between 3 and 20 items");
    }

    payload.pairs.forEach((p, idx) => {
      if (!p.keyText.trim() || !p.valueText.trim()) {
        throw new Error(`Pair ${idx + 1}: Term and Definition are required`);
      }
    });

    // Prepare FormData (Multipart)
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("thumbnail_image", payload.thumbnailImage);
    formData.append(
      "is_publish_immediately",
      String(payload.isPublishImmediately ?? false),
    );

    // Prepare and append pairs JSON
    const pairsPayload: CreateMatchUpPair[] = payload.pairs.map((p) => ({
      key_text: p.keyText,
      value_text: p.valueText,
    }));

    formData.append("pairs", JSON.stringify(pairsPayload));

    const res = await api.post<CreateMatchUpResponse>(
      "/api/game/game-list/match-up",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res.data;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to create Match Up game";
    console.error("Gagal membuat Match Up:", err);
    toast.error(errorMessage);
    throw err;
  }
};
