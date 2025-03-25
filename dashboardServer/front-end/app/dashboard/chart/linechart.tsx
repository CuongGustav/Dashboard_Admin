'use client'

import React, { useEffect, useRef, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import { fetchServerHistory } from "@/app/services/chartService";
import { HiArrowsPointingOut, HiArrowsPointingIn } from "react-icons/hi2";

interface ServerHistory {
  cpu_history: number[];
  ram_history: number[];
  disk_history: number[];
  last_reported: string;
}

const averageData = (arr: (string | number)[]): number[] => {
  const averaged: number[] = [];
  for (let i = 0; i < arr.length; i += 5) {
    const chunk = arr.slice(i, i + 5).map(item => parseFloat(item.toString()));
    const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
    averaged.push(avg);
  }
  return averaged;
};

const LineChart: React.FC<{
  serverName: string | null;
  timeRange: string | null;
  height: string;
  zoomServer: string | null;
  selectServer: string | null; // Thêm selectServer vào props
  setZoomServer: (value: string | null) => void;
  setSelectServer: (value: string | null) => void;
}> = ({ serverName, timeRange, height, setZoomServer, setSelectServer, zoomServer, selectServer }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<ServerHistory | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (chartRef.current?.parentElement) {
        setContainerWidth(chartRef.current.parentElement.clientWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    if (chartRef.current?.parentElement) {
      resizeObserver.observe(chartRef.current.parentElement);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  const getChartOptions = useCallback((containerWidth: number) => ({
    animation: { duration: 0 },
    elements: {
      point: {
        hitRadius: isMobile ? 3 : 5,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          font: {
            size: containerWidth < 600 ? 10 : 12,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 30,
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  }), [isMobile]);

  const getDatasets = useCallback((data: ServerHistory, borderWidth: number, pointRadius: number) => [
    {
      label: "CPU",
      data: data.cpu_history.map(item => Number(item)),
      backgroundColor: "transparent",
      borderColor: "#007bff",
      borderWidth: borderWidth,
      pointBackgroundColor: "#007bff",
      pointRadius: pointRadius,
      tension: 0.4,
    },
    {
      label: "RAM",
      data: data.ram_history.map(item => Number(item)),
      backgroundColor: "transparent",
      borderColor: "#28a745",
      borderWidth: borderWidth,
      pointBackgroundColor: "#28a745",
      pointRadius: pointRadius,
      tension: 0.4,
    },
    {
      label: "Disk",
      data: data.disk_history.map(item => Number(item)),
      backgroundColor: "transparent",
      borderColor: "#dc3545",
      borderWidth: borderWidth,
      pointBackgroundColor: "#dc3545",
      pointRadius: pointRadius,
      tension: 0.4,
    },
  ], []);

  const updateChart = useCallback(() => {
    if (!dataRef.current || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const labelTime = timeRange === "5m"
      ? (() => {
          const lastReported = new Date(dataRef.current.last_reported);
          return Array.from({ length: dataRef.current.cpu_history.length }, (_, i) => {
            const time = new Date(lastReported.getTime() - (25 - i * 5) * 60000);
            return time.toTimeString().split(' ')[0];
          });
        })()
      : (() => {
          const lastReported = new Date(dataRef.current.last_reported);
          return Array.from({ length: dataRef.current.cpu_history.length }, (_, i) => {
            const time = new Date(lastReported.getTime() - (29 - i) * 60000);
            return time.toTimeString().split(' ')[0];
          });
        })();

    const borderWidth = isMobile ? 2 : 4;
    const pointRadius = 0;

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labelTime,
        datasets: getDatasets(dataRef.current, borderWidth, pointRadius),
      },
      options: getChartOptions(containerWidth),
    });
  }, [timeRange, isMobile, containerWidth, getChartOptions, getDatasets]);

  const fetchData = useCallback(async () => {
    if (serverName === null) return;

    try {
      const result = await fetchServerHistory(serverName);
      const processedData: ServerHistory = { ...result };
      if (timeRange === "5m") {
        processedData.cpu_history = averageData(result.cpu_history);
        processedData.ram_history = averageData(result.ram_history);
        processedData.disk_history = averageData(result.disk_history);
      }
      dataRef.current = processedData;
      updateChart();
    } catch (error) {
      console.error("Error fetching data:", error);
      dataRef.current = null;
      updateChart();
    }
  }, [serverName, timeRange, updateChart]);

  useEffect(() => {
    if (serverName === null || timeRange === null) return;

    void fetchData();
    intervalRef.current = setInterval(fetchData, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [serverName, timeRange, fetchData]);

  // Kiểm tra trạng thái zoom dựa trên selectServer và zoomServer
  const isZoomed = zoomServer !== null || selectServer !== 'all';

  return (
    <div className="py-1 col-span-4 w-full overflow-x-hidden mt-0 p-[10px] shadow-[0px_0px_5px_rgba(0,0,0,0.4)] rounded-[5px]">
      <div className="flex justify-between items-center text-gray-700">
        <p className="font-mts text-[16px] font-[700] text-gray-700 mb-[10px] mt-[5px]">{serverName}</p>
        <button
          title="Zoom chart"
          type="button"
          onClick={() => {
            if (!isZoomed) {
              setZoomServer(serverName);
              setSelectServer(serverName);
            } else {
              setZoomServer(null);
              setSelectServer("all");
            }
          }}
          className="flex items-center justify-center bg-white h-[28px] w-[28px] rounded-[5px]"
        >
          {isZoomed ? <HiArrowsPointingIn className="text-[20px]" /> : <HiArrowsPointingOut className="text-[20px]" />}
        </button>
      </div>
      <div className="chart-container w-full" style={{ height: isMobile ? '270px' : height, minWidth: '100%', maxWidth: '100%' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default React.memo(LineChart);