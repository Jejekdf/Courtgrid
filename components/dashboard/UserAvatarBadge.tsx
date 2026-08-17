import Link from "next/link";

interface UserAvatarBadgeProps {
  userName: string;
  userImage: string | null;
  userInitial: string;
}

export function UserAvatarBadge({
  userName,
  userImage,
  userInitial,
}: UserAvatarBadgeProps) {
  return (
    <Link href="/dashboard/settings">
      <div className="flex items-center gap-2.5 p-1 pr-2 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitial}
          </div>
        )}
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-semibold text-zinc-950 leading-none truncate max-w-28">
            {userName}
          </span>
          <span className="text-xs text-zinc-400 mt-0.5 leading-none font-mono">
            Pelanggan
          </span>
        </div>
      </div>
    </Link>
  );
}
