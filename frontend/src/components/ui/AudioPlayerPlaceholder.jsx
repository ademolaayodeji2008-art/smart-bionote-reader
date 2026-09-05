import { useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import IconButton from "./IconButton.jsx";

/**
 * Visual placeholder for the future audio narration player. Toggles a
 * play/pause icon for demonstration only — no audio is actually loaded
 * or played in this phase.
 */
const AudioPlayerPlaceholder = ({ title = "Audio narration", duration = "3:45" }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
      <IconButton
        icon={isPlaying ? Pause : Play}
        label={isPlaying ? "Pause" : "Play"}
        variant="primary"
        onClick={() => setIsPlaying((prev) => !prev)}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-small font-medium text-text-strong">{title}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className={`h-full rounded-full bg-primary transition-all ${isPlaying ? "w-1/3" : "w-0"}`} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-caption normal-case tracking-normal text-text-muted">
        <Volume2 className="h-4 w-4" aria-hidden="true" />
        <span>{duration}</span>
      </div>
    </div>
  );
};

export default AudioPlayerPlaceholder;
