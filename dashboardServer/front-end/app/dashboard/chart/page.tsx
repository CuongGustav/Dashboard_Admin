'use client';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getServerList } from '@/app/services/serversListService';
import LineChart from './linechart';
import PieChart from './piechart';
import BarChart from './barchart';
import styles from '../../styles/chartlayout.module.css';
import { FaCaretUp, FaLongArrowAltUp, FaCaretDown, FaLongArrowAltDown } from "react-icons/fa";

interface Server {
    name: string;
}

const ChartLayout = () => {
    const [servers, setServers] = useState<Server[]>([]);
    const [selectServer, setSelectServer] = useState<string | null>('all');
    const [chartType, setChartType] = useState<string | null>('lineChart');
    const [selectTimeRange, setSelectTimeRange] = useState<string | null>('1m');
    const [activeDropChart, setActiveDropChart] = useState<'line' | 'pie' | 'bar'>('line');
    const [activeDropMinute, setActiveDropMinute] = useState<'1' | '5'>('1');
    const [zoomServer, setZoomServer] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const serverListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (serverListRef.current && !serverListRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const result = await getServerList();
                const savedServers = localStorage.getItem('serverOrder');
                if (savedServers) {
                    const parsedServers = JSON.parse(savedServers);
                    setServers(parsedServers);
                } else {
                    setServers(result);
                }
            } catch (error) {
                console.error("Error fetching server list", error);
            }   
        };
        void fetchServers();
    }, []);

    useEffect(() => {
        console.log('SLE', selectServer);
        servers.map((server) => {
            console.log('SERVER__: ', server.name);
        });
    }, [servers, selectServer]);

    // MoveUp
    const moveServerUp = (index: number) => {
        if (index === 0) return;
        const newServers = [...servers];
        [newServers[index - 1], newServers[index]] = [newServers[index], newServers[index - 1]];
        setServers(newServers);
        saveServerOrder(newServers);
    };

    // MoveDown
    const moveServerDown = (index: number) => {
        if (index === servers.length - 1) return;
        const newServers = [...servers];
        [newServers[index], newServers[index + 1]] = [newServers[index + 1], newServers[index]];
        setServers(newServers);
        saveServerOrder(newServers);
    };

    // Save list server in localStorage
    const saveServerOrder = (newServers: Server[]) => {
        localStorage.setItem('serverOrder', JSON.stringify(newServers));
    };

    // Handle drag end
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return; 

        const newServers = Array.from(servers);
        const [movedServer] = newServers.splice(result.source.index, 1);
        newServers.splice(result.destination.index, 0, movedServer);

        setServers(newServers);
        saveServerOrder(newServers);
    };

    return (
        <div className="mx-auto px-2 md:px-4">
            <div className={`${styles.headerChart} flex justify-between items-center pb-1 flex-nowrap`}>
                <div className="min-w-0 flex-shrink overflow-hidden">
                    <h1 className="text-3xl md:text-4xl font-medium cursor-pointer truncate">CHART</h1>
                </div>
            </div>
            <div className="flex flex-row">
                <div className="flex flex-grow flex-col w-full">
                    <div
                        className="flex p-2 flex-grow flex-wrap md:flex-nowrap justify-between"
                        style={{
                            position: chartType === 'barChart' || chartType === 'pieChart' ? 'absolute' : 'relative',
                            opacity: chartType === 'barChart' || chartType === 'pieChart' ? 0 : 1,
                            pointerEvents: chartType === 'barChart' || chartType === 'pieChart' ? 'none' : 'auto',
                            transition: 'opacity 0.3s ease-in-out',
                        }}
                    >
                        {/* Server List */}
                        <div className="block w-full md:w-auto mb-2">
                            <div className="min-w-[300px]">
                                <div className="relative" ref={serverListRef}>
                                    {/* Button */}
                                    <div
                                        className="border border-slate-200 rounded bg-white p-2 cursor-pointer flex justify-between items-center"
                                        onClick={() => setIsOpen(!isOpen)}
                                    >
                                        <span>{selectServer === 'all' ? 'All' : selectServer}</span>
                                        <span>{isOpen ? <FaCaretUp /> : <FaCaretDown />}</span>
                                    </div>
                                    {/* List Hidden/Show */}
                                    {isOpen && (
                                        <DragDropContext onDragEnd={handleDragEnd}>
                                            <div className="absolute top-full left-0 right-0 border border-slate-200 rounded bg-white min-w-[300px] h-[400px] overflow-y-auto z-10">
                                                <div
                                                    className={`p-2 cursor-pointer hover:bg-gray-200 hover:text-black ${
                                                        selectServer === 'all' ? 'bg-blue-500 text-white' : ''
                                                    }`}
                                                    onClick={() => {
                                                        setSelectServer('all');
                                                        setZoomServer(null);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    All
                                                </div>
                                                <Droppable droppableId="servers">
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                        >
                                                            {servers.map((server, index) => (
                                                                <Draggable
                                                                    key={server.name}
                                                                    draggableId={server.name}
                                                                    index={index}
                                                                >
                                                                    {(provided) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`w-full flex justify-between items-center p-2 cursor-pointer hover:bg-gray-200 hover:text-black ${
                                                                                selectServer === server.name ? 'bg-blue-500 text-white' : ''
                                                                            }`}
                                                                        >
                                                                            <span
                                                                                onClick={() => {
                                                                                    setSelectServer(server.name);
                                                                                    setZoomServer(null);
                                                                                    setIsOpen(false);
                                                                                }}
                                                                                className="flex-1"
                                                                            >
                                                                                {server.name}
                                                                            </span>
                                                                            <div className="flex gap-0">
                                                                                <button
                                                                                    onClick={() => moveServerUp(index)}
                                                                                    disabled={index === 0}
                                                                                    className={`text-sm ${
                                                                                        index === 0
                                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                                            : selectServer === server.name
                                                                                            ? 'text-blue-300 hover:text-blue-700'
                                                                                            : 'text-blue-500 hover:text-blue-700'
                                                                                    }`}
                                                                                >
                                                                                    <FaLongArrowAltUp />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => moveServerDown(index)}
                                                                                    disabled={index === servers.length - 1}
                                                                                    className={`pl-[2px] text-sm ${
                                                                                        index === servers.length - 1
                                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                                            : selectServer === server.name
                                                                                            ? 'text-blue-300 hover:text-blue-700'
                                                                                            : 'text-blue-500 hover:text-blue-700'
                                                                                    }`}
                                                                                >
                                                                                    <FaLongArrowAltDown />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        </DragDropContext>
                                    )}
                                </div>
                            </div>
                        </div>
                        {chartType === "lineChart" ? (
                            <div className="flex w-[200px] justify-between mt-4">
                                <div className="w-[60px] bg-red-700 h-[25px] flex justify-center items-center rounded-[5px]">
                                    <p className="text-gray-50 font-mts font-[700] text-[16px]">DISK</p>
                                </div>
                                <div className="w-[60px] bg-green-700 h-[25px] flex justify-center items-center rounded-[5px]">
                                    <p className="text-gray-50 font-mts font-[700] text-[16px]">RAM</p>
                                </div>
                                <div className="w-[60px] bg-blue-700 h-[25px] flex justify-center items-center rounded-[5px]">
                                    <p className="text-gray-50 font-mts font-[700] text-[16px]">CPU</p>
                                </div>
                            </div>
                        ) : null}
                        {/* DropMenu */}
                        <div className="flex flex-row gap-1 md:justify-end md:w-auto">
                            {/* DropMenu Minute */}
                            <div style={{ visibility: chartType === "lineChart" ? "visible" : "hidden" }}>
                                <Menu as="div" className="relative inline-block text-left">
                                    <div>
                                        <MenuButton
                                            className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-blue-500 hover:text-gray-100"
                                        >
                                            Minute
                                            <i className="fa-solid fa-caret-down ps-1"></i>
                                        </MenuButton>
                                    </div>
                                    <MenuItems
                                        transition
                                        className="absolute right-0 z-10 mt-1 w-[100px] origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                    >
                                        <div className={`${styles.itemChart}`}>
                                            <MenuItem
                                                as="a"
                                                key="1m"
                                                href="#"
                                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                                    activeDropMinute === "1" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                }`}
                                                onClick={() => {
                                                    setSelectTimeRange("1m");
                                                    setActiveDropMinute("1");
                                                }}
                                            >
                                                1m
                                            </MenuItem>
                                            <MenuItem
                                                as="a"
                                                key="5m"
                                                href="#"
                                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                                    activeDropMinute === "5" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                }`}
                                                onClick={() => {
                                                    setSelectTimeRange("5m");
                                                    setActiveDropMinute("5");
                                                }}
                                            >
                                                5m
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </Menu>
                            </div>
                            {/* DropMenu Chart */}
                            <div className="mr-1 mb-1 md:mb-0">
                                <Menu as="div" className="relative inline-block text-left">
                                    <div>
                                        <MenuButton
                                            className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-blue-500 hover:text-gray-100"
                                        >
                                            Chart
                                            <i className="fa-solid fa-caret-down ps-1"></i>
                                        </MenuButton>
                                    </div>
                                    <MenuItems
                                        transition
                                        className="absolute right-0 mt-1 z-10 w-[100px] origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                    >
                                        <div className={`${styles.itemChart}`}>
                                            <MenuItem
                                                as="a"
                                                key="lineChart"
                                                href="#"
                                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                                    activeDropChart === "line" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                }`}
                                                onClick={() => {
                                                    setChartType("lineChart");
                                                    setActiveDropChart("line");
                                                }}
                                            >
                                                Line Chart
                                            </MenuItem>
                                            <MenuItem
                                                as="a"
                                                key="pieChart"
                                                href="#"
                                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                                    activeDropChart === "pie" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                }`}
                                                onClick={() => {
                                                    setChartType("pieChart");
                                                    setActiveDropChart("pie");
                                                }}
                                            >
                                                Pie Chart
                                            </MenuItem>
                                            <MenuItem
                                                as="a"
                                                key="barChart"
                                                href="#"
                                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                                    activeDropChart === "bar" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                }`}
                                                onClick={() => {
                                                    setChartType("barChart");
                                                    setActiveDropChart("bar");
                                                }}
                                            >
                                                Bar Chart
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </Menu>
                            </div>
                        </div>
                    </div>
                    {/* Chart */}
                    <div className="w-full overflow-x-auto">
                    {chartType === "lineChart" ? (
                        <div
                            className={`${selectServer === 'all' && zoomServer === null ? "grid-cols-12" : "grid-cols-4"} grid pt-2 gap-5 min-w-[300px] p-[10px] relative`}
                        >
                            {selectServer === 'all' ? (
                            zoomServer === null ? (
                                servers.map((server) => (
                                <LineChart
                                    key={`lineChart${server.name}`}
                                    serverName={server.name}
                                    timeRange={selectTimeRange}
                                    height="300px"
                                    setZoomServer={setZoomServer}
                                    setSelectServer={setSelectServer}
                                    zoomServer={zoomServer}
                                    selectServer={selectServer} 
                                />
                                ))
                            ) : (
                                <LineChart
                                key="lineChart"
                                serverName={zoomServer}
                                timeRange={selectTimeRange}
                                height="600px"
                                setZoomServer={setZoomServer}
                                setSelectServer={setSelectServer}
                                zoomServer={zoomServer}
                                selectServer={selectServer} 
                                />
                            )
                            ) : (
                            <LineChart
                                key="lineChart"
                                serverName={selectServer}
                                timeRange={selectTimeRange}
                                height="600px"
                                setZoomServer={setZoomServer}
                                setSelectServer={setSelectServer}
                                zoomServer={zoomServer}
                                selectServer={selectServer} 
                            />
                            )}
                        </div>
                        ) : chartType === "pieChart" ? (
                            <div className="min-w-[300px] relative">
                                <div className="absolute top-0 right-0 z-10 mt-4 mr-4">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <div>
                                            <MenuButton
                                                className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-blue-500 hover:text-gray-100"
                                            >
                                                Chart
                                                <i className="fa-solid fa-caret-down ps-1"></i>
                                            </MenuButton>
                                        </div>
                                        <MenuItems
                                            transition
                                            className="absolute right-0 mt-1 z-10 w-[100px] origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                        >
                                            <div className={`${styles.itemChart}`}>
                                                <MenuItem
                                                    as="a"
                                                    key="lineChart"
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm text-gray-700 ${
                                                        activeDropChart === "line" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                    }`}
                                                    onClick={() => {
                                                        setChartType("lineChart");
                                                        setActiveDropChart("line");
                                                    }}
                                                >
                                                    Line Chart
                                                </MenuItem>
                                                <MenuItem
                                                    as="a"
                                                    key="pieChart"
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm text-gray-700 ${
                                                        activeDropChart === "pie" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                    }`}
                                                    onClick={() => {
                                                        setChartType("pieChart");
                                                        setActiveDropChart("pie");
                                                    }}
                                                >
                                                    Pie Chart
                                                </MenuItem>
                                                <MenuItem
                                                    as="a"
                                                    key="barChart"
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm text-gray-700 ${
                                                        activeDropChart === "bar" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                    }`}
                                                    onClick={() => {
                                                        setChartType("barChart");
                                                        setActiveDropChart("bar");
                                                    }}
                                                >
                                                    Bar Chart
                                                </MenuItem>
                                            </div>
                                        </MenuItems>
                                    </Menu>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <PieChart key="pieChart" />
                                </div>
                            </div>
                        ) : chartType === "barChart" ? (
                            <div className="min-w-[300px] relative">
                                <div className="absolute top-0 right-0 z-10 mt-4 mr-5">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <div>
                                            <MenuButton
                                                className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-blue-500 hover:text-gray-100"
                                            >
                                                Chart
                                                <i className="fa-solid fa-caret-down ps-1"></i>
                                            </MenuButton>
                                        </div>
                                        <MenuItems
                                            transition
                                            className="absolute right-0 mt-1 z-10 w-[100px] origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                        >
                                            <div className={`${styles.itemChart}`}>
                                                <MenuItem
                                                    as="a"
                                                    key="lineChart"
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm text-gray-700 ${
                                                        activeDropChart === "line" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                    }`}
                                                    onClick={() => {
                                                        setChartType("lineChart");
                                                        setActiveDropChart("line");
                                                    }}
                                                >
                                                    Line Chart
                                                </MenuItem>
                                                <MenuItem
                                                    as="a"
                                                    key="pieChart"
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm text-gray-700 ${
                                                        activeDropChart === "pie" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                    }`}
                                                    onClick={() => {
                                                        setChartType("pieChart");
                                                        setActiveDropChart("pie");
                                                    }}
                                                >
                                                    Pie Chart
                                                </MenuItem>
                                                <MenuItem
                                                    as="a"
                                                    key="barChart"
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm text-gray-700 ${
                                                        activeDropChart === "bar" ? "bg-blue-500 text-gray-100" : "bg-white"
                                                    }`}
                                                    onClick={() => {
                                                        setChartType("barChart");
                                                        setActiveDropChart("bar");
                                                    }}
                                                >
                                                    Bar Chart
                                                </MenuItem>
                                            </div>
                                        </MenuItems>
                                    </Menu>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <BarChart key="barChart" />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartLayout;
