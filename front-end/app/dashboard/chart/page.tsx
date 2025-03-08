'use client'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useEffect, useState } from "react";
import LineChart from "./linechart";
import PieChart from "./piechart";
import BarChart from './barchart';
import ModalCreateServer from "../../components/chart.modalcreateserver"
import styles from "../../styles/chartlayout.module.css"

const ChartLayout = () => {

    const [servers, setServers] = useState<Server[]>([]); 
    const [selectServer, setSelectServer] = useState<number | null>(1);
    const [chartType, setChartType] = useState<string | null>("lineChart");
    const [selectTimeRange, setSelectTimeRange] = useState<string | null>("1m");
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    const [activeDropChart, setActiveDropChart] = useState<"line" | "pie" | "bar">("line")
    const [activeDropMinute, setActiveDropMinute] = useState<"1" | "5">("1")

    useEffect(() => {
        const serverList = async () => {
            try{
                const response = await fetch('/data/listserver.json');
                const result = await response.json();
                setServers(result);
            } catch (error) {
                console.log("Error fetching data", error);
            }
        };

        serverList();
    }, []);

    const handleServerClick = async (id:number) => {
        setSelectServer(id);
    }
    const handleAddServerClick = () => {
        setShowCreateModal(true)
    }
    const closeCreateModal = () => {
        setShowCreateModal(false);
    };
    return (
        <div className="mx-auto px-2 md:px-4">
            <div className={`${styles.headerChart} flex justify-between items-center pb-1 flex-nowrap`}>
                {/*Title Header*/}
                <div className="min-w-0 flex-shrink overflow-hidden">
                    <h1 className="text-3xl md:text-4xl font-medium cursor-pointer truncate">
                        Chart
                    </h1>
                </div>
                {/*Button Add Server*/}
                <div className="flex-shrink-0">
                    <button 
                        type="button" 
                        className="border border-gray-500 text-gray-900 px-4 py-2 rounded-md 
                                hover:bg-blue-500 hover:text-white hover:border-blue-500"
                        onClick={handleAddServerClick}
                    >
                        <i className="fa-solid fa-plus pe-1"></i>
                        Add server
                    </button>
                </div>
            </div>

            {/*Display Area*/}
            <div className="flex flex-row">
                {/*DropMenu-SelectMenu Chart */}    
                <div className="flex flex-grow flex-col w-full">
                    {/*DropMenu-SelectMenu*/}
                    <div className="flex p-2 flex-grow flex-wrap md:flex-nowrap">
                        {/*SelectMenu server*/}
                        <div className='block w-full md:w-auto mb-2 '>
                            {chartType !== "barChart" ? (
                                <div className=" min-w-[200px]">      
                                    <div className="relative">
                                        <select
                                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2
                                                transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 
                                                shadow-sm focus:shadow-md appearance-none cursor-pointer"
                                            onChange={(e) => {
                                                const selectedServer = servers.find((server) => server.name === e.target.value);
                                                if (selectedServer) {
                                                    handleServerClick(selectedServer.server_id);
                                                }
                                            }}
                                        >
                                            {servers?.map((server, index) => (
                                                <option key={server.server_id | index} value={server.name}>
                                                    {server.name}
                                                </option>
                                            ))}
                                        </select>
                                        <i className="fa-solid fa-caret-down absolute right-2 top-2 text-xl"></i>
                                    </div>
                                </div>
                            ) : (
                                <h3 className="text-2xl"></h3>
                            )}  
                        </div>
                        {/* DropMenu */}
                        <div className='flex flex-grow gap-1 justify-end md:justify-end w-full md:w-auto'>
                            {/* DropMenu Chart*/}
                            <div className="mr-1 mb-1 md:mb-0">
                                <Menu as="div" className="relative inline-block text-left">
                                    <div>
                                        <MenuButton className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
                                            Chart
                                            <i className="fa-solid fa-caret-down ps-1"></i>
                                        </MenuButton>
                                    </div>
                                    <MenuItems
                                        transition
                                        className="absolute right-0 mt-1 z-10 w-[100px] origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                    >
                                        <div className={`${styles.itemChart}`}>
                                            <MenuItem as="a"
                                                href="#"
                                                className={`block px-4 py-2 text-sm text-gray-700
                                                    ${activeDropChart === "line" ? "bg-blue-500 text-white" : "bg-white"}
                                                `}                                             
                                                onClick={() => 
                                                    {setChartType("lineChart"); setActiveDropChart("line")}
                                                }
                                            >
                                                Line Chart
                                            </MenuItem>
                                            <MenuItem as="a"
                                                href="#"
                                                className={`
                                                    block px-4 py-2 text-sm text-gray-700
                                                    ${activeDropChart === "pie" ? "bg-blue-500 text-white" : "bg-white"}
                                                `}
                                                onClick={() => 
                                                    {setChartType("pieChart"); setActiveDropChart("pie")}
                                                }
                                            >
                                                Pie Chart
                                            </MenuItem>
                                            <MenuItem as="a"
                                                href="#"
                                                className={`
                                                    block px-4 py-2 text-sm text-gray-700
                                                    ${activeDropChart == "bar" ? "bg-blue-500 text-white" : "bg-white"}
                                                `}
                                                onClick={() => 
                                                    {setChartType("barChart"); setActiveDropChart("bar")}
                                                }
                                            >
                                                Bar Chart                                               
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </Menu>
                            </div>
                            {/* DropMenu Minute*/}
                            <div>
                                <Menu as="div" className="relative inline-block text-left">
                                    <div>
                                        <MenuButton className={`
                                            inline-flex w-full justify-center items-center gap-x-1.5 
                                            rounded-md bg-white px-3 py-2 text-sm font-semibold 
                                          text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50`}
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
                                            <MenuItem as="a"
                                                href="#"
                                                className={`
                                                    block px-4 py-2 text-sm text-gray-700 
                                                    ${activeDropMinute === "1" ? "bg-blue-500 text-white" : "bg-white"}
                                                `}
                                                onClick={() => 
                                                    {setSelectTimeRange("1m"); setActiveDropMinute("1")}
                                                }
                                                >1m
                                            </MenuItem>
                                            <MenuItem as="a"
                                                href="#"
                                                className={`
                                                    block px-4 py-2 text-sm text-gray-700 
                                                    ${activeDropMinute === "5" ? "bg-blue-500 text-white" : "bg-white"}
                                                `}
                                                onClick={() => 
                                                    {setSelectTimeRange("5m"); setActiveDropMinute("5")}
                                                }
                                                >5m
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
                                <div className="grid grid-cols-12 pt-2 min-w-[300px]">
                                    <LineChart serverId={selectServer} timeRange={selectTimeRange}/> 
                                </div>
                        ) : chartType === "pieChart" ? (
                            <div className="min-w-[300px]">
                                <PieChart serverId={selectServer}/>
                            </div>
                        ) : chartType === "barChart" ? (
                            <div className="min-w-[300px]">
                                <BarChart/>     
                            </div>
                        ) : null
                        }
                    </div>
                </div>
            </div>
            {/* Modal */}
            <ModalCreateServer showModal={showCreateModal} closeModal={closeCreateModal} />
        </div>
    );
};

export default ChartLayout;

