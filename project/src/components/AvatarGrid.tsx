interface Contributor {
  id: string;
  avatar: string;
  username: string;
  contributions: number;
}

interface AvatarGridProps {
  contributors: Contributor[];
  maxDisplay?: number;
}

export default function AvatarGrid({ contributors, maxDisplay = 8 }: AvatarGridProps) {
  const displayedContributors = contributors.slice(0, maxDisplay);
  const remaining = Math.max(0, contributors.length - maxDisplay);

  return (
    <div className="flex flex-wrap gap-2">
      {displayedContributors.map((contributor) => (
        <div
          key={contributor.id}
          className="group relative"
          title={`${contributor.username} - ${contributor.contributions} contributions`}
        >
          <img
            src={contributor.avatar}
            alt={contributor.username}
            className="w-10 h-10 rounded-full border-2 border-gray-700 hover:border-teal-500 transition-all cursor-pointer"
          />
          <div className="absolute bottom-0 right-0 bg-[#0f1720] border border-gray-700 rounded-full px-1.5 py-0.5 text-xs text-gray-400 font-medium">
            {contributor.contributions}
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-10 h-10 rounded-full bg-[#1a2332] border-2 border-gray-700 flex items-center justify-center text-xs font-medium text-gray-400">
          +{remaining}
        </div>
      )}
    </div>
  );
}
