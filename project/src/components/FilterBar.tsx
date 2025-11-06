import Chip from './Chip';
import Button from './Button';

interface FilterBarProps {
  selectedTechs: string[];
  onTechToggle: (tech: string) => void;
  selectedDifficulty: string | null;
  onDifficultyChange: (difficulty: string | null) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const techOptions = ['Node.js', 'Next.js', 'React', 'Python', 'Django', 'TypeScript', 'Go', 'Java', 'Rust'];
const difficultyOptions = ['Easy', 'Medium', 'Hard'];
const sortOptions = [
  { value: 'trending', label: 'Trending' },
  { value: 'stars', label: 'Most Stars' },
  { value: 'new', label: 'New' }
];

export default function FilterBar({
  selectedTechs,
  onTechToggle,
  selectedDifficulty,
  onDifficultyChange,
  sortBy,
  onSortChange
}: FilterBarProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">Technologies</label>
        <div className="flex flex-wrap gap-2">
          {techOptions.map((tech) => (
            <Chip
              key={tech}
              label={tech}
              selected={selectedTechs.includes(tech)}
              onClick={() => onTechToggle(tech)}
              variant="tech"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">Difficulty</label>
        <div className="flex gap-2">
          {difficultyOptions.map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty.toLowerCase() ? 'primary' : 'secondary'}
              size="sm"
              onClick={() =>
                onDifficultyChange(
                  selectedDifficulty === difficulty.toLowerCase() ? null : difficulty.toLowerCase()
                )
              }
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">Sort by</label>
        <div className="relative inline-block">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-[#0f1728] border border-gray-800/50 rounded-2xl text-gray-200 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
