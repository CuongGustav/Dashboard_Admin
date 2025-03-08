'use client'

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const LineChart: React.FC<{ serverId: number | null, timeRange: string | null }> = ({ serverId, timeRange }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Gọi ngay khi component mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Add resize observer to handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current?.parentElement) {
        setContainerWidth(chartRef.current.parentElement.clientWidth);
      }
    };

    // Initial size check
    handleResize();

    // Set up resize observer for responsive updates
    const resizeObserver = new ResizeObserver(handleResize);
    if (chartRef.current?.parentElement) {
      resizeObserver.observe(chartRef.current.parentElement);
    }

    window.addEventListener('resize', handleResize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (serverId === null) return; // If no serverId, don't fetch data

    const fetchData = async () => {
      try {
        const response = await fetch(`/data/dataserver${serverId}.json`);
        const result = await response.json();

        // Function to calculate the average for every 5 data points
        const averageData = (arr: string[]) => {
          const averaged: number[] = [];
          for (let i = 0; i < arr.length; i += 5) {
            const chunk = arr.slice(i, i + 5).map(item => parseFloat(item));
            const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
            averaged.push(avg);
          }
          return averaged;
        };

        // Update data for "5m" time range
        if (timeRange === "5m") {
          result.cpu_history = averageData(result.cpu_history);
          result.ram_history = averageData(result.ram_history);
          result.disk_history = averageData(result.disk_history);
        }

        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(null);
      }
    };

    fetchData();
  }, [serverId, timeRange]); // Reload data when serverId or timeRange changes

  useEffect(() => {
    if (!data) return;

    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      const labelTime = timeRange === "5m" 
        ? Array.from({ length: data.cpu_history.length }, (_, i) => ((i + 1) * 5).toString())
        : Array.from({ length: data.cpu_history.length }, (_, i) => `${i + 1}`);

      // Adjust point radius and border width based on screen size
      const isMobile = window.innerWidth < 768;
      const borderWidth = isMobile ? 2 : 4;
      const pointRadius = 0;
      const pointHitRadius = isMobile ? 3 : 5;

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: labelTime,
          datasets: [
            {
              label: "CPU",
              data: data.cpu_history.map((item: string) => parseFloat(item)),
              backgroundColor: "transparent",
              borderColor: "#007bff",
              borderWidth: borderWidth,
              pointBackgroundColor: "#007bff",
              pointRadius: pointRadius,
              tension: 0.4,
            },
            {
              label: "RAM",
              data: data.ram_history.map((item: string) => parseFloat(item)),
              backgroundColor: "transparent",
              borderColor: "#28a745",
              borderWidth: borderWidth,
              pointBackgroundColor: "#28a745",
              pointRadius: pointRadius,
              tension: 0.4
            },
            {
              label: "Disk",
              data: data.disk_history.map((item: string) => {
                const value = typeof item === "string" ? item.split(" ")[0] : item;
                return parseFloat(value);
              }),
              backgroundColor: "transparent",
              borderColor: "#dc3545",
              borderWidth: borderWidth,
              pointBackgroundColor: "#dc3545",
              pointRadius: pointRadius,
              tension: 0.4
            }
          ]
        },
        options: {
            elements: {
                point: {
                  hitRadius: pointHitRadius,
                }
            },
            scales: {
                x: {
                  ticks: {
                    maxTicksLimit: isMobile ? 5 : data.cpu_history.length, 
                    stepSize: isMobile ? undefined : 1, 
                    font: {
                      size: isMobile ? 10 : 12
                    }
                  }
                },
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    font: {
                      size: isMobile ? 10 : 12
                    }
                  }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                      boxWidth: isMobile ? 30 : 40,
                      padding: isMobile ? 8 : 10,
                      font: {
                        size: isMobile ? 10 : 12
                      }
                    }
                },
                tooltip: {
                  bodyFont: {
                    size: isMobile ? 10 : 12
                  },
                  titleFont: {
                    size: isMobile ? 10 : 12
                  }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
      });
    }
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [data, timeRange, containerWidth]); // Added containerWidth to dependencies

  return (
    <div className="py-1 col-span-12 w-full overflow-x-hidden mt-0">
      <div className="chart-container w-full" 
        style={{ height: isMobile ? '270px' : '500px', minWidth: '100%', maxWidth: '100%'}}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default LineChart;
