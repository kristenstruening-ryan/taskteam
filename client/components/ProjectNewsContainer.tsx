import ProjectNewsFeed from "./ProjectNewsFeed";

interface NewsPulseCardProps {
  boardId: string;
  newsKey: number;
  velocity: number; 
}

export default function ProjectNewsContainer({
  boardId,
  newsKey,
  velocity,
}: NewsPulseCardProps) {
  return (
    <div className="w-full">
      <ProjectNewsFeed key={newsKey} boardId={boardId} velocity={velocity} />
    </div>
  );
}
