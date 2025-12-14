// src/pages/MatchUp/components/PauseDialog.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PauseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const PauseDialog: React.FC<PauseDialogProps> = ({
  isOpen,
  onResume,
  onRestart,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-xl shadow-2xl text-center">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-bold text-yellow-600">
            Game Paused
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600 mb-6">
          Take a breath! Your progress is safe.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onResume}
            className="bg-green-600 hover:bg-green-700 py-3 text-lg"
          >
            Resume Game
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 text-lg"
          >
            Restart Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PauseDialog;
