// src/pages/MatchUp/components/EditMatchUpForm.tsx

import { useState } from "react";
import { Plus, Trash2, SaveIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Dropzone from "@/components/ui/dropzone";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useUpdateMatchUp } from "@/api/match-up/useUpdateMatchUp";
import type { MatchUpUpdatePayload } from "@/api/match-up/useUpdateMatchUp";
import type { MatchUpPair } from "@/api/match-up/useCreateMatchUp";
import { useNavigate } from "react-router-dom";

// --- Type Definitions (Sync dengan BE) ---
type MaybeFileOrUrl = File | string | null;

interface ApiPair {
  key_text: string;
  value_text: string;
}

interface InitialApiData {
  name: string;
  description: string;
  thumbnail_image: string | null;
  is_published: boolean;
  game_json: {
    pairs: ApiPair[];
  };
}

// --- Component Props & Konstanta ---
const MIN_PAIRS = 3;
const MAX_PAIRS = 20;

interface EditFormProps {
  initialData: InitialApiData;
  gameId: string;
}

function EditMatchUpForm({ initialData, gameId }: EditFormProps) {
  const navigate = useNavigate();
  const updateMatchUpGame = useUpdateMatchUp;

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // --- Data State ---
  const [title, setTitle] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<MaybeFileOrUrl>(
    initialData.thumbnail_image,
  );

  // Mapping data BE ke state frontend
  const [pairs, setPairs] = useState<MatchUpPair[]>(
    initialData.game_json.pairs.map((p) => ({
      keyText: p.key_text,
      valueText: p.value_text,
    })),
  );
  const [isPublished, setIsPublished] = useState(initialData.is_published);

  // --- Handlers & Validation (disingkat) ---
  const handleAddPair = () => {
    if (pairs.length >= MAX_PAIRS) {
      toast.error(`Maximum ${MAX_PAIRS} pairs allowed`);
      return;
    }
    setPairs((prev) => [...prev, { keyText: "", valueText: "" }]);
  };

  const handleRemovePair = (index: number) => {
    if (pairs.length <= MIN_PAIRS) {
      toast.error(`Minimum ${MIN_PAIRS} pairs required`);
      return;
    }
    setPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePairChange = (
    index: number,
    field: keyof MatchUpPair,
    value: string,
  ) => {
    setPairs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const handleThumbnailChange = (file: File | null) => {
    setThumbnailFile(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else if (!file && !initialData.thumbnail_image) {
      setThumbnailPreview(null);
    }
    // Validasi thumbnail harus memastikan salah satu (File baru atau URL lama) ada
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length > 128) {
      newErrors["title"] = "Game Title is required (max 128 chars)";
    }
    if (!description.trim() || description.trim().length > 256) {
      newErrors["description"] = "Description is required (max 256 chars)";
    }
    if (!thumbnailPreview) {
      newErrors["thumbnail"] = "Thumbnail image is required";
    }
    // ... (Validasi Pairs)
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit Handler ---
  const handleUpdate = async () => {
    if (!validateAllFields()) {
      toast.error("Please fix all highlighted errors before updating.");
      return;
    }

    const apiPayload: MatchUpUpdatePayload = {
      name: title,
      description: description,
      isPublish: isPublished,
      // Kirim thumbnailFile hanya jika ada perubahan File baru
      thumbnailImage: thumbnailFile instanceof File ? thumbnailFile : undefined,
      pairs: pairs.map((p) => ({ keyText: p.keyText, valueText: p.valueText })),
    };

    try {
      setLoading(true);
      await updateMatchUpGame(gameId, apiPayload);
      toast.success("Match Up game updated successfully!");
      navigate("/my-projects");
    } catch {
      // Error handling ada di hook useUpdateMatchUp
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        {/* 1. Basic Information Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="game-title">Game Title *</Label>
              <Input
                id="game-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {formErrors["title"] && (
                <p className="text-red-500 text-sm">{formErrors["title"]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              {formErrors["description"] && (
                <p className="text-red-500 text-sm">
                  {formErrors["description"]}
                </p>
              )}
            </div>

            {/* Thumbnail Upload/Preview */}
            <div className="space-y-2">
              <Label>Thumbnail Image *</Label>
              {thumbnailPreview && typeof thumbnailPreview === "string" && (
                <div className="relative mb-3">
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                    }}
                    className="absolute top-1 right-1 bg-red-600 p-1 rounded-full text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <Dropzone
                required
                allowedTypes={["image/png", "image/jpeg", "image/gif"]}
                maxSize={10 * 1024 * 1024} // 10MB
                onChange={handleThumbnailChange}
              />
              {formErrors["thumbnail"] && (
                <p className="text-red-500 text-sm">
                  {formErrors["thumbnail"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Word Pairs Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Word Pairs ({pairs.length})
            </h2>
            <Button
              onClick={handleAddPair}
              disabled={pairs.length >= MAX_PAIRS}
            >
              <Plus size={16} /> Add Pair
            </Button>
          </div>

          {pairs.map((pair, index) => (
            <div
              key={index}
              className={`p-4 mb-4 rounded-lg border ${formErrors[`pairs.${index}.key`] || formErrors[`pairs.${index}.value`] ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex justify-end mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePair(index)}
                  disabled={pairs.length <= MIN_PAIRS}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Term"
                  value={pair.keyText}
                  onChange={(e) =>
                    handlePairChange(index, "keyText", e.target.value)
                  }
                />
                <Input
                  placeholder="Definition"
                  value={pair.valueText}
                  onChange={(e) =>
                    handlePairChange(index, "valueText", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* 3. Settings Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Settings</h2>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-gray-700 font-medium">Publish Game</Label>
              <Typography variant="small" className="text-gray-500 mt-1 block">
                Control whether the game is visible to the public
                (Published/Draft).
              </Typography>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="py-3 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <SaveIcon size={20} />
            {loading ? "Updating Game..." : "Update Match Up Game"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditMatchUpForm;
