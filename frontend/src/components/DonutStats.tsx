import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  wins: number;
  losses: number;
  draws: number;
}

export const PlayerStatsDonutChart: React.FC<Props> = ({ wins, losses, draws }) => {
  const total = wins + losses + draws;
  const emptyColor = "#d1d5db"

  const emptyData = {
    labels: ["Пусто"],
    datasets: [
      {
        label: "Нет данных",
        data: [1],
        backgroundColor: [emptyColor],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const emptyCenterTextPlugin = {
    id: "centerText",
    beforeDraw: (chart: any) => {
      const { width, height, ctx } = chart;
      ctx.restore();
      ctx.font = `1.4rem sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#a1a1aa";

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

  const emptyOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            context.label = "Пусто"
            context.dataset.backgroundColor = [emptyColor]
            return `Игр: 0`;
          },
        },
        backgroundColor: emptyColor,
        titleColor: "#374151",
        bodyColor: "#374151",
        borderColor: "#fff",
        borderWidth: 1,
      },
    },
    cutout: "85%",
  };

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
    cutout: "85%",
  };

  const legendItems = [
    { label: "Победы", value: wins, color: "#22c55e" },
    { label: "Поражения", value: losses, color: "#ef4444" },
    { label: "Ничьи", value: draws, color: "#f59e0b" },
  ];

  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <div className="w-[200px] md:w-[300px]">
        {total === 0 ? (
          <Doughnut
            data={emptyData}
            options={emptyOptions}
            plugins={[emptyCenterTextPlugin]}
          />
        ) : (
          <Doughnut
            data={data}
            options={options}
            plugins={[centerTextPlugin]}
          />
        )}
      </div>

      {total > 0 && (
        <div className="mt-4 w-full sm:w-auto flex flex-col items-center md:flex-row">
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
      )}
    </div>
  );
};
