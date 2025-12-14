// src/pages/MatchUp/components/CreateMatchUpForm.tsx

import { useState } from "react";
import { Plus, Trash2, SaveIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Dropzone from "@/components/ui/dropzone";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { MatchUpPayload } from "@/api/match-up/useCreateMatchUp";
import { createMatchUp } from "@/api/match-up/useCreateMatchUp"; // Diimpor sebagai fungsi async

// --- Type Definitions ---
interface FormPair {
  keyText: string;
  valueText: string;
}

interface FormSettings {
  isPublishImmediately: boolean;
}

// --- Component ---
const initialPair: FormPair = { keyText: "", valueText: "" };
const MAX_PAIRS = 20;
const MIN_PAIRS = 3;

function CreateMatchUpForm() {
  const navigate = useNavigate();

  // 🛑 FIX HOOK RULE: Hapus pemanggilan useCreateMatchUp di sini.
  // const createGameFunction = useCreateMatchUp(); <- dihapus

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false); // Menggunakan loading lokal

  // --- Data State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [pairs, setPairs] = useState<FormPair[]>([initialPair]);
  const [settings, setSettings] = useState<FormSettings>({
    isPublishImmediately: true,
  });

  // --- Handlers & Validation (dilewati untuk fokus pada handleSubmit) ---

  const handleAddPair = () => {
    if (pairs.length >= MAX_PAIRS) {
      toast.error(`Maximum ${MAX_PAIRS} pairs allowed`);
      return;
    }
    setPairs((prev) => [...prev, initialPair]);
  };

  const handleRemovePair = (index: number) => {
    if (pairs.length <= MIN_PAIRS) {
      toast.error(`Minimum ${MIN_PAIRS} pairs required`);
      return;
    }
    setPairs((prev) => prev.filter((_, i) => i !== index));
    validatePairs();
  };

  const handlePairChange = (
    index: number,
    field: keyof FormPair,
    value: string,
  ) => {
    setPairs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
    validatePairs();
  };

  const handleThumbnailChange = (file: File | null) => {
    setThumbnail(file);
    validateThumbnail(file);
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.trim().length > 128) {
      newErrors["title"] = "Game Title is required (max 128 chars)";
    }
    if (!description.trim() || description.trim().length > 256) {
      newErrors["description"] = "Description is required (max 256 chars)";
    }
    if (!thumbnail) {
      newErrors["thumbnail"] = "Thumbnail image is required";
    }

    if (pairs.length < MIN_PAIRS || pairs.length > MAX_PAIRS) {
      newErrors["pairs"] =
        `Must have between ${MIN_PAIRS} and ${MAX_PAIRS} pairs`;
    } else {
      pairs.forEach((p, pIndex) => {
        if (!p.keyText.trim()) {
          newErrors[`pairs.${pIndex}.key`] = `Term ${pIndex + 1} is required`;
        }
        if (!p.valueText.trim()) {
          newErrors[`pairs.${pIndex}.value`] =
            `Definition ${pIndex + 1} is required`;
        }
      });
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTitle = (value: string) => {
    const newErrors = { ...formErrors };
    if (!value.trim() || value.trim().length > 128) {
      newErrors["title"] = "Game Title is required (max 128 chars)";
    } else {
      delete newErrors["title"];
    }
    setFormErrors(newErrors);
  };

  const validateDescription = (value: string) => {
    const newErrors = { ...formErrors };
    if (!value.trim() || value.trim().length > 256) {
      newErrors["description"] = "Description is required (max 256 chars)";
    } else {
      delete newErrors["description"];
    }
    setFormErrors(newErrors);
  };

  const validateThumbnail = (file: File | null) => {
    const newErrors = { ...formErrors };
    if (!file) {
      newErrors["thumbnail"] = "Thumbnail image is required";
    } else {
      delete newErrors["thumbnail"];
    }
    setFormErrors(newErrors);
  };

  const validatePairs = () => {
    const newErrors = { ...formErrors };

    Object.keys(newErrors)
      .filter((key) => key.startsWith("pairs."))
      .forEach((key) => delete newErrors[key]);

    if (pairs.length < MIN_PAIRS || pairs.length > MAX_PAIRS) {
      newErrors["pairs"] =
        `Must have between ${MIN_PAIRS} and ${MAX_PAIRS} pairs`;
    } else {
      pairs.forEach((p, pIndex) => {
        if (!p.keyText.trim()) {
          newErrors[`pairs.${pIndex}.key`] = `Term ${pIndex + 1} is required`;
        }
        if (!p.valueText.trim()) {
          newErrors[`pairs.${pIndex}.value`] =
            `Definition ${pIndex + 1} is required`;
        }
      });
    }
    setFormErrors(newErrors);
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    if (!validateAllFields()) {
      toast.error(
        "Please fix all highlighted errors before creating the game.",
      );
      return;
    }

    if (!thumbnail) {
      toast.error("Thumbnail image is missing.");
      return;
    }

    const apiPayload: MatchUpPayload = {
      name: title,
      description: description,
      thumbnailImage: thumbnail,
      isPublishImmediately: settings.isPublishImmediately,
      pairs: pairs.map((p) => ({
        keyText: p.keyText,
        valueText: p.valueText,
      })),
    };

    try {
      setLoading(true);

      // Panggil createMatchUp sebagai fungsi async langsung di sini.
      await createMatchUp(apiPayload);

      toast.success("Match Up game created successfully!");
      navigate(`/my-projects`);
    } catch (error: unknown) {
      // 🛑 FIX: Tambahkan tipe 'unknown' pada error
      console.error("Error creating Match Up game:", error);
      toast.error(
        "Failed to create Match Up game. Please check your network or input.",
      );
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
              <Label htmlFor="game-title" className="text-gray-700">
                Game Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="game-title"
                placeholder="Game Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  validateTitle(e.target.value);
                }}
                className={formErrors["title"] ? "border-red-500" : ""}
              />
              {formErrors["title"] && (
                <p className="text-red-500 text-sm">{formErrors["title"]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">
                Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                placeholder="Description"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  validateDescription(e.target.value);
                }}
                className={`w-full p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 ${formErrors["description"] ? "border-red-500" : "border-gray-300"}`}
              />
              {formErrors["description"] && (
                <p className="text-red-500 text-sm">
                  {formErrors["description"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">
                Thumbnail Image <span className="text-red-500">*</span>
              </Label>
              <Dropzone
                required
                allowedTypes={["image/png", "image/jpeg", "image/gif"]}
                maxSize={10 * 1024 * 1024}
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
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
            >
              <Plus size={16} /> Add Pair
            </Button>
          </div>

          {pairs.map((pair, index) => (
            <div
              key={index}
              className={`p-4 mb-4 rounded-lg border transition-all ${
                formErrors[`pairs.${index}.key`] ||
                formErrors[`pairs.${index}.value`]
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <Typography variant="p" className="font-medium text-gray-700">
                  Pair {index + 1}
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePair(index)}
                  disabled={pairs.length <= MIN_PAIRS}
                  className="text-red-500 hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`term-${index}`}>
                    Term {index + 1} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`term-${index}`}
                    placeholder={`e.g., Cat`}
                    value={pair.keyText}
                    onChange={(e) =>
                      handlePairChange(index, "keyText", e.target.value)
                    }
                    className={
                      formErrors[`pairs.${index}.key`] ? "border-red-500" : ""
                    }
                  />
                  {formErrors[`pairs.${index}.key`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[`pairs.${index}.key`]}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`definition-${index}`}>
                    Definition {index + 1}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`definition-${index}`}
                    placeholder={`e.g., A domestic animal...`}
                    value={pair.valueText}
                    onChange={(e) =>
                      handlePairChange(index, "valueText", e.target.value)
                    }
                    className={
                      formErrors[`pairs.${index}.value`] ? "border-red-500" : ""
                    }
                  />
                  {formErrors[`pairs.${index}.value`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors[`pairs.${index}.value`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {formErrors["pairs"] && (
            <p className="text-red-500 text-sm mt-2">{formErrors["pairs"]}</p>
          )}
        </div>

        {/* 3. Settings Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Settings</h2>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-gray-700 font-medium">
                Publish Immediately
              </Label>
              <Typography variant="small" className="text-gray-500 mt-1 block">
                Game will be visible to others immediately after creation.
              </Typography>
            </div>
            <Switch
              checked={settings.isPublishImmediately}
              onCheckedChange={(val) =>
                setSettings((prev) => ({
                  ...prev,
                  isPublishImmediately: val,
                }))
              }
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full max-w-sm py-3 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <SaveIcon size={20} />
            {loading ? "Creating Game..." : "Create Match Up Game"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateMatchUpForm;
