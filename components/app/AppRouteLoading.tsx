import Spinner from "@/components/feedback/Spinner";

type AppRouteLoadingProps = {
  label?: string;
  fullScreen?: boolean;
};

export default function AppRouteLoading({
  label = "Loading your workspace…",
  fullScreen = false
}: AppRouteLoadingProps) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-[#0a0b10] px-6"
          : "flex min-h-[min(70vh,520px)] items-center justify-center px-6 py-16"
      }
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner className="h-5 w-5 text-zinc-400" />
        <p className="text-sm text-zinc-500">{label}</p>
      </div>
    </div>
  );
}
