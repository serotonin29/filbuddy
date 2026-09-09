export type LeaderRow = {
  name: string;
  meta: string;
  pts: number;
};

const others: LeaderRow[] = [
  { name: "Aditya Pratama", meta: "IF '21 · Mentor AI", pts: 1420 },
  { name: "Maya Rosalina", meta: "SI '21 · Data Science", pts: 980 },
  { name: "Rahmat Danu", meta: "IF '22 · Web Backend", pts: 320 },
  { name: "Kevin Novian", meta: "SK '22 · IoT Dev", pts: 210 },
  { name: "Tari Lestari", meta: "IF '23 · Flutter", pts: 185 },
  { name: "Dinda Permata", meta: "SI '22 · Video Editing", pts: 150 },
];

export function getLeaderboard(user: {
  name: string;
  prodi: string;
  points: number;
} | null): LeaderRow[] {
  const rows = user
    ? [
        ...others,
        { name: user.name, meta: `${user.prodi} '22 · Buddy`, pts: user.points },
      ]
    : [...others];
  return rows.sort((a, b) => b.pts - a.pts);
}
