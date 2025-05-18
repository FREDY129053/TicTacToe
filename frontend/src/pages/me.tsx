import MainLayout from "@/components/layouts/MainLayout";
import React, { useEffect, useState } from "react";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { decodeJWT } from "@/functions/decodeJWT";
import { Stats, getUserStats } from "./api/user";

ChartJS.register(ArcElement, Tooltip, Legend);
interface Props {
  wins: number;
  losses: number;
  draws: number;
}

export default function Me() {
  const [statistic, setStatistic] = useState<Stats | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uuid = decodeJWT(token);
    if (!uuid) return;

    getUserStats(uuid).then(setStatistic).catch(console.error)
  }, []);

  return (
    <MainLayout>
      {statistic ? (
        <PlayerStatsDonutChart wins={statistic.wins} losses={statistic.losses} draws={statistic.draws}/>
      ) : (<div>Loading...</div>)}
    </MainLayout>
  );
}

const PlayerStatsDonutChart: React.FC<Props> = ({ wins, losses, draws }) => {
  const total = wins + losses + draws;

  const data = {
    labels: ["Победы", "Поражения", "Ничьи"],
    datasets: [
      {
        label: "Статистика игр",
        data: [wins, losses, draws],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart: any) => {
      const { width, height, ctx } = chart;
      ctx.restore();
      ctx.font = `1.5rem sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#333";

      const text = "ВСЕГО ИГР";
      const value = total.toString();

      // Текст заголовка
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2 - 10;
      ctx.fillText(text, textX, textY);

      // Текст числа
      ctx.font = `bold text-base sans-serif`;
      const valueX = Math.round((width - ctx.measureText(value).width) / 2);
      const valueY = height / 2 + 20;
      ctx.fillText(value, valueX, valueY);

      ctx.save();
    },
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    cutout: "80%",
  };

  const legendItems = [
    { label: "Победы", value: wins, color: "#22c55e" },
    { label: "Поражения", value: losses, color: "#ef4444" },
    { label: "Ничьи", value: draws, color: "#f59e0b" },
  ];

  return (
    <div className="flex flex-col items-center mt-2">
      <div className="w-[300px]">
        <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
      </div>

      <div className="mt-4 w-full sm:w-auto">
        <ul className="flex flex-col gap-2 text-sm sm:flex-row sm:justify-center sm:gap-6">
          {legendItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-neutral-700">
                {item.label} - {item.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
