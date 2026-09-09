import { DashboardHero } from "@/components/app/DashboardHero";
import { DashboardStats } from "@/components/app/DashboardStats";
import { MatchRecommendations } from "@/components/app/MatchRecommendations";
import { MySlots } from "@/components/app/MySlots";
import { KarmaLeaderboard } from "@/components/app/KarmaLeaderboard";
import { RecentActivity } from "@/components/app/RecentActivity";
import { QuestCard } from "@/components/app/QuestCard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHero />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 flex flex-col gap-6">
          <DashboardStats />
          <MatchRecommendations />
          <MySlots />
        </div>
        <div className="xl:col-span-4 flex flex-col gap-6">
          <KarmaLeaderboard />
          <RecentActivity />
          <QuestCard />
        </div>
      </div>
    </div>
  );
}
