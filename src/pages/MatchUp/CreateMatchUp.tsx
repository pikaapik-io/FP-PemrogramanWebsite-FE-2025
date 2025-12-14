// src/pages/MatchUp/CreateMatchUp.tsx

import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// Asumsi background Anda adalah aset lokal di direktori game
import backgroundImage from "./assets/backgroundcreate.jpg";
import CreateMatchUpForm from "./components/CreateMatchUpForm";

function CreateMatchUp() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full min-h-screen bg-cover bg-fixed bg-center text-gray-800 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Navbar */}
      <nav className="backdrop-blur-md bg-white/80 border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-serif text-3xl text-indigo-700 tracking-wider">
              Match Up
            </h1>
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate("/create-projects")}
                className="font-sans text-gray-600 hover:text-indigo-700 transition-colors duration-300 text-sm"
              >
                <ArrowLeft className="inline mr-2" size={16} />
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full py-8 sm:py-12 px-3 sm:px-6 md:px-8 flex justify-center font-sans">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Create Match Up Game
            </h1>
            <p className="text-gray-300 text-lg">
              Design pairs of terms and definitions for players to match.
            </p>
          </div>

          <CreateMatchUpForm />

          {/* Action Buttons (minimalisir di wrapper) */}
          <div className="flex justify-end mt-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  className="border-2 border-gray-400 text-gray-700 bg-white/50 hover:bg-white/70 transition-all rounded-xl font-semibold px-6 py-3 text-sm"
                >
                  <X size={16} className="mr-2" /> Cancel Creation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-xl backdrop-blur-md bg-white/90 border-2 border-gray-300">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl text-indigo-700">
                    Abandon Creation?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    All unsaved progress will be lost. Are you certain?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">
                    Continue Editing
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => navigate("/create-projects")}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Abandon
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateMatchUp;
