import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Track {
  id: string;
  name: string;
}

interface TrackSelectorProps {
  tracks: Track[];
  selectedTrackIds: string[];
  onChange: (trackIds: string[]) => void;
}

export function TrackSelector({ tracks, selectedTrackIds, onChange }: TrackSelectorProps) {
  const handleTrackChange = (trackId: string, checked: boolean) => {
    const newValue = checked
      ? [...selectedTrackIds, trackId]
      : selectedTrackIds.filter((id) => id !== trackId);
    onChange(newValue);
  };

  return (
    <FormItem>
      <FormLabel className="text-base">Project Tracks</FormLabel>
      <FormControl>
        <div className="space-y-2">
          {tracks.map((track) => (
            <label
              key={track.id}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                checked={selectedTrackIds.includes(track.id)}
                onChange={(e) => handleTrackChange(track.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {track.name}
              </span>
            </label>
          ))}
        </div>
      </FormControl>
      <FormDescription className="text-sm">
        Select the tracks your project will participate in.
      </FormDescription>
      <FormMessage className="text-sm" />
    </FormItem>
  );
}