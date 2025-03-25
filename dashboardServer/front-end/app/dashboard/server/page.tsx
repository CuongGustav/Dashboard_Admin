'use client'

import React, { useState, useEffect} from "react";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/serverlayout.module.css";
import ModalRead from "../../components/server.modalreadserver"
import ModalUpdate from "../../components/server.modalupdateserver"
import ModalDelete from "../../components/server.modaldeleteserver"

const backEndAPI = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

const ManagementServerPage = () => {
    const [servers, setServers] = useState<ServerJson[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModalRead, setShowModalRead] = useState(false); 
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [currentServerName, setCurrentServerName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Get All Server
    const getAllServer = async () => {
        try {
            const response = await fetch(`${backEndAPI}/serverAdmin/GetAllServerJSON`);
            if (!response.ok) {
                throw new Error("Failed to fetch server data");
            }
            const data: ServerJson[] = await response.json();
            setServers(data);
        } catch (err) {
            console.error("Error fetching server data:", err);
            alert("Failed to fetch server data");
        }
    };
    console.log(searchQuery)
    
    // Get all server Search by name 
    const searchServerByName = async (name: string) => {
        try {
            const response = await fetch(`${backEndAPI}/serverAdmin/SearchServerByNameJSON?servername=${name}`);
            if (!response.ok) {
                throw new Error("Failed to fetch server data");
            }
            const data: ServerJson[] = await response.json();
            setServers(data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch server data");
        }
    };
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchQuery(value); 
        if (value.trim() !== "") {
            searchServerByName(value);
        } else {
            getAllServer();
        }
    };

    {/*Read Modal*/}
    const openModalRead = (serverName: string) => {
        setCurrentServerName(serverName); 
        setShowModalRead(true); 
    };
    const closeModalRead = () => {
        setShowModalRead(false); 
        setCurrentServerName(null); 
    };
    
    {/*Update Modal*/}
    const openModalUpdate = (serverName: string) => {
        setCurrentServerName(serverName); 
        setShowModalUpdate(true); 
    };
    const closeModalUpdate = () => {
        setShowModalUpdate(false); 
        setCurrentServerName(null); 
    };
    {/*Delete Modal*/}
    const openModalDelete = (serverName: string) => {
        setCurrentServerName(serverName)
        setShowModalDelete(true)
    }
    const closeModalDelete = () => {
        setShowModalDelete(false)
        setCurrentServerName(null)
    }

    // Navigation Page
    const rowsPerPage = 8;
    const totalPages = Math.ceil(servers.length / rowsPerPage);
    const maxVisiblePages = 5;
    const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2);
    let startPage = currentPage - halfMaxVisiblePages;
    let endPage = currentPage + halfMaxVisiblePages;

    if (startPage < 1) {
        startPage = 1;
        endPage = Math.min(maxVisiblePages, totalPages);
    } else if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
    const currentRows = servers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        getAllServer();
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* Title Header */}
            <div>
                <div className="min-w-0 flex-shrink overflow-hidden pb-5">
                    <h1 className="text-3xl md:text-4xl font-medium cursor-pointer truncate">
                        Server Config
                    </h1>
                </div>
            </div>
            <div className="flex flex-col flex-grow justify-between border border-t border-l-0 border-r-0 border-b-0 border-[#9ca3af]">
                <div>
                    {/* SelectMenu Filter Search */}
                    <div className="flex w-full gap-4 flex-col md:flex-row justify-between mt-4 ">
                        {/* SelectMenu UserName */}
                        <div>
                            <div className="relative w-full min-w-[170px] md:min-w-[200px] items-center">
                                <span
                                    className="bg-transparent shadow-sm focus:shadow-md items-center 
                                    border border-gray-300 rounded py-3 px-8 flex w-full justify-center
                                   "
                                >
                                    All
                                </span>
                            </div>
                        </div>
                        {/* Search */}
                        <div
                            className=" flex flex-row justify-center items-center
                            border border-gray-300 rounded"
                        >
                            <input
                                className="p-2 pl-4 focus:outline-none rounded lg:w-full items-center"
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery} 
                                onChange={handleSearchInputChange} 
                            />
                        </div>
                    </div>
                    {/* Display List */}
                    <div className="md:container lg:max-w-none mx-auto mt-9 overflow-x-auto">
                        <table className={`${styles.serverTable} border w-full table-auto bg-white min-w-auto`}>
                            <thead>
                                <tr className="bg-slate-500">
                                    <th className="max-w-[200px] md:max-w-[350px] overflow-hidden truncate">Name Server</th>
                                    <th className="hidden md:table-cell">
                                        <span>CPU<br />Threshold</span>
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <span>RAM<br />Threshold</span>
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <span>DISK<br />Threshold</span>
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <span>CPU Count<br />Threshold</span>
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <span>RAM Count<br />Threshold</span>
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <span>DISK Count<br />Threshold</span>
                                    </th>
                                    <th className={`hidden md:table-cell`}>
                                        Channel
                                    </th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                            {currentRows?.map((server, index) => (
                                <tr key={index} className={`${styles.serverTableBody} hover:bg-slate-200`}>
                                    <th className="flex-1 max-w-[200px] md:max-w-[350px] overflow-hidden truncate">
                                        <a
                                            className={`hover:cursor-pointer hover:text-blue-500 ps-2`}
                                            onClick={() => openModalRead(server.server_name)}
                                        >
                                            {server.server_name}
                                        </a>
                                    </th>
                                    <th className="hidden md:table-cell w-[104px]">{server.cpu_threshold}</th>
                                    <th className="hidden md:table-cell w-[104px]">{server.ram_threshold}</th>
                                    <th className="hidden md:table-cell w-[104px]">{server.disk_threshold}</th>
                                    <th className="hidden md:table-cell w-[120px]">{server.cpu_count_threshold}</th>
                                    <th className="hidden md:table-cell w-[120px]">{server.ram_count_threshold}</th>
                                    <th className="hidden md:table-cell w-[120px]">{server.disk_count_threshold}</th>
                                    <th className="hidden md:table-cell max-w-[150px] ">
                                        <p className="ps-2 overflow-hidden truncate">
                                            {server.google_chat_webhooks}
                                        </p>
                                    </th>
                                    <th className="w-20">
                                        <div className="flex gap-1 justify-center">
                                            <button
                                                className="border border-gray-300 rounded p-1 px-2
                                                        hover:bg-blue-500 hover:text-white hover:rounded"
                                                onClick={() => openModalUpdate(server.server_name)}
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button
                                                className="border border-gray-300 rounded p-1 px-2
                                                        hover:bg-red-500 hover:text-white hover:rounded"
                                                onClick={() => openModalDelete(server.server_name)}
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded"
                    >
                        Previous
                    </button>

                    {pages.map((page) => (
                        <button
                            key={page} // Sử dụng `page` làm key vì nó là duy nhất
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-500 text-white' : ''}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded"
                    >
                        Next
                    </button>
                </div>
            </div>
            {/* Modals */}
            <ModalRead
                isOpen={showModalRead}
                serverName={currentServerName}
                onClose={closeModalRead}
            />
            <ModalUpdate
                isOpen={showModalUpdate}
                serverName={currentServerName}
                onClose={closeModalUpdate}
            />
            <ModalDelete
                isOpen={showModalDelete}
                serverName={currentServerName}
                onClose={closeModalDelete}
            />
        </div>
    );
};

export default ManagementServerPage;