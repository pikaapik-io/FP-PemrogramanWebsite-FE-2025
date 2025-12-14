// src/pages/MatchUp/EditMatchUp.tsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
// Import deleteMatchUp sebagai fungsi async murni
import { deleteMatchUp } from "@/api/match-up/useDeleteMatchUp";

// Asumsi background dan komponen UI diimpor dari tempat yang benar
import backgroundImage from "./assets/backgroundcreate.jpg";
import EditMatchUpForm from "./components/EditMatchUpForm";

// --- Type Definitions ---
interface ApiPair {
  key_text: string;
  value_text: string;
}

interface ApiData {
  name: string;
  description: string;
  thumbnail_image: string | null;
  is_published: boolean;
  game_json: {
    pairs: ApiPair[];
  };
}

function EditMatchUp() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<ApiData | null>(null);

  // --- Fetch Data Logic ---
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No game ID provided");
      return;
    }

    const fetchMatchUp = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/game/game-list/match-up/${id}`);
        setInitialData(res.data.data as ApiData);
      } catch (err) {
        let errorMessage = "Failed to load Match Up game";
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as {
            response?: { status?: number; data?: { message?: string } };
          };
          errorMessage = axiosError.response?.data?.message || errorMessage;
          if (axiosError.response?.status === 404) {
            setError(`Game not found. The game with ID "${id}" doesn't exist.`);
          } else {
            setError(errorMessage);
          }
        } else {
          setError(errorMessage);
        }
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchUp();
  }, [id]);

  // Handle Delete Game
  const handleDelete = async () => {
    if (!id) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this game? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await deleteMatchUp(id);
      toast.success("Game deleted successfully.");
      navigate("/my-projects");
    } catch {
      toast.error("Failed to delete game.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading Game Data...
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-4">
        <h2 className="text-2xl text-red-400 mb-4">Error Loading Game</h2>
        <p className="text-gray-300 mb-6 text-center">{error}</p>
        <Button
          onClick={() => navigate("/my-projects")}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen bg-cover bg-fixed bg-center text-gray-800 relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <nav className="backdrop-blur-md bg-white/80 border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-serif text-3xl text-indigo-700 tracking-wider">
              Edit Match Up
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Game"}
              </Button>
              <button
                onClick={() => navigate("/my-projects")}
                className="font-sans text-gray-600 hover:text-indigo-700 transition-colors duration-300 text-sm"
              >
                <ArrowLeft className="inline mr-2" size={16} />
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full py-8 sm:py-12 px-3 sm:px-6 md:px-8 flex justify-center font-sans">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Edit Game: {initialData.name}
            </h1>
          </div>
          <EditMatchUpForm initialData={initialData} gameId={id!} />
        </div>
      </div>
    </div>
  );
}

export default EditMatchUp;
