"use client";

interface PromptFormProps {
  onGenerate: (prompt: string, aspectRatio: string) => void;
  isGenerating: boolean;
}

export default function PromptForm({ onGenerate, isGenerating }: PromptFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const prompt = (form.elements.namedItem("prompt") as HTMLTextAreaElement).value;
        const aspectRatio = (form.elements.namedItem("aspectRatio") as HTMLSelectElement).value;
        if (prompt.trim()) onGenerate(prompt, aspectRatio);
      }}
      className="w-full space-y-4"
    >
      <textarea
        name="prompt"
        placeholder="Describe your video idea... (a blue llama will be added automatically!)"
        rows={3}
        className="w-full rounded-xl border border-blue-500/30 bg-slate-800/50 p-4 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none text-lg"
        disabled={isGenerating}
        required
      />
      <div className="flex items-center gap-4">
        <select
          name="aspectRatio"
          className="rounded-lg border border-blue-500/30 bg-slate-800/50 px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
          disabled={isGenerating}
        >
          <option value="16:9">16:9 Landscape</option>
          <option value="9:16">9:16 Portrait (TikTok/Reels)</option>
          <option value="1:1">1:1 Square</option>
        </select>
        <button
          type="submit"
          disabled={isGenerating}
          className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate Video"}
        </button>
      </div>
    </form>
  );
}
