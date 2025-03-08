'use client'

import React,{ useState, useEffect, useCallback} from "react"
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/serverlayout.module.css"
import ModalRead from "../../components/server.modalreadserver"
import ModalUpdate from "../../components/server.modalupdateserver"
import ModalDelete from "../../components/server.modaldeleteserver"

let debounceTimeout: NodeJS.Timeout;

const ManagementServerPage = () => {

    const [users, setUsers] = useState<User[]>([]);
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedUser, setSelectedUser] = useState<number | "All">("All")
    const [searchByName, setSearchByName] = useState("")
    const [showModalRead, setShowModalRead] = useState(false); 
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [currentServerId, setCurrentServerId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);


    {/*Get all server*/}
    const serverList = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/serverAdmin/ServerAll');
            const result = await response.json();
            setServers(result);
        } catch (error) {
            console.log("Error fetching data", error);
            alert("Đã xảy ra lỗi trong khi lấy danh sách server.");
        }
    };
    
    const handleSelectUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = event.target.value === 'All' ? 'All' : parseInt(event.target.value);
        setSelectedUser(userId);
    };
    
    {/*Get all user*/}
    const userList = async () => {
        try{
            const response = await fetch ('http://127.0.0.1:5000/serverAdmin/UserAll');
            const result = await response.json();
            setUsers(result);
        } catch (error) {
            console.log("Error fetching data", error);
            alert("Đã xảy ra lỗi trong khi lấy danh sách sách.");
        }
    };

    {/*Sorted All Data*/} 
    const serverAllSorted = async ( sort_by: string, order: string) => {
        try{
            const reponse = await fetch (`http://127.0.0.1:5000/serverAdmin/GetAllServerSorted/?sort_by=${sort_by}&order=${order}`)
            const result = await reponse.json()
    

            if(Array.isArray(result)){
                setServers(result);
            }

        } catch (error) {
            console.log("Error fetching data", error);
            alert("Đã xảy ra lỗi trong khi lấy danh sách sách.");
        }
    };
    
       
    {/*Sort Server, Get Server By User*/}
    const serverByUserSorted = async (userId: number, sort_by: string, order: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/serverAdmin/ServerByUserSorted/${userId}?sort_by=${sort_by}&order=${order}`)
            const result = await response.json()
            console.log(result)
            setServers(result)
        } catch (error) {
            console.log("Error fetching data", error);
            alert("Đã xảy ra lỗi trong khi lấy danh sách sách.");
        }
    }

    {/*Sort Server, Get Server By ServerName*/}
    const serversByNameSort = async (sort_by: string, order: string) => {
        try{
            const response = await fetch(`http://127.0.0.1:5000/serverAdmin/ServerSearchByNameSort?server_name=${searchByName}&sort_by=${sort_by}&order=${order}`)
            const result = await response.json()
            setServers(result)
        } catch (error){
            console.log("Error fetching data", error);
            alert("Đã xảy ra lỗi trong khi lấy danh sách sách.");
        }
    }

    {/*Handel Sort*/}
    const handleSort = (sort_by: string, order: string) => {
        if (searchByName){
            serversByNameSort(sort_by, order);
        }
        else if (selectedUser === 'All') {
            serverAllSorted(sort_by, order);
        } else {
            serverByUserSorted(selectedUser, sort_by, order);
        }
    };

    {/*Read Modal*/}
    const openModalRead = (serverId: number) => {
        setCurrentServerId(serverId); 
        setShowModalRead(true); 
    };
    const closeModalRead = () => {
        setShowModalRead(false); 
        setCurrentServerId(null); 
    };

    {/*Update Modal*/}
    const openModalUpdate = (serverId: number) => {
        setCurrentServerId(serverId); 
        setShowModalUpdate(true); 
    };
    const closeModalUpdate = () => {
        setShowModalUpdate(false); 
        setCurrentServerId(null); 
    };

    {/*Delete Modal*/}
    const openModalDelete = (serverId: number) => {
        setCurrentServerId(serverId)
        setShowModalDelete(true)
    }
    const closeModalDelete = () => {
        setShowModalDelete(false)
        setCurrentServerId(null)
    }

    {/*Navigation Page*/}
    const rowsPerPage = 8;
    const totalPages = Math.ceil(servers.length/rowsPerPage);
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

    {/*Get server by user and search servername*/}
    const getServersByUser = useCallback( async (userid: number) => {
        try {
            let url = `http://127.0.0.1:5000/serverAdmin/GetAllServerByUser/${userid}`;
            if (searchByName.trim() !== "") {
                url = `http://127.0.0.1:5000/serverAdmin/SearchServerByNameServerAndUser/?user_id=${userid}&server_name=${encodeURIComponent(searchByName)}`;
            }
    
            const response = await fetch(url);
            const result = await response.json();
            setServers(result);
        } catch (error) {
            console.log("Error fetching data", error);
            alert("Đã xảy ra lỗi trong khi lấy danh sách server.");
        }
    },[searchByName]);


    useEffect(() => {
        const fetchData = async () => {
            if (selectedUser === "All") {
                if (searchByName.trim() === "") {
                    await serverList(); 
                } else {
                    try {
                        const response = await fetch(
                            `http://127.0.0.1:5000/serverAdmin/SearchServerByName/?server_name=${encodeURIComponent(searchByName)}`
                        );
                        const result = await response.json();
                        setServers(result);
                    } catch (error) {
                        console.log("Error fetching data", error);
                        alert("Đã xảy ra lỗi trong khi lấy danh sách server.");
                    }
                }
            } else {
                await getServersByUser(selectedUser);
            }
        };
    
        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            fetchData();
        }, 400);
    }, [selectedUser, searchByName, getServersByUser]); 
    

    {/*useEffect UserList */}
    useEffect(()=> {
        userList()
    }, [])


    return (
        <div className="flex flex-col h-full">
            {/*Title Header*/}
            <div>
                <div className="min-w-0 flex-shrink overflow-hidden pb-5">
                    <h1 className="text-3xl md:text-4xl font-medium cursor-pointer truncate">
                        Server Config
                    </h1>
                </div>
            </div>
            <div className="flex flex-col flex-grow justify-between border border-t border-l-0 border-r-0 border-b-0 border-[#9ca3af]">
                <div>
                    {/*SelectMenu Filter Search*/}
                    <div className="flex w-full gap-4 flex-col md:flex-row justify-between mt-4 ">
                        {/*SelectMenu UserName*/}
                        <div>
                            <div className="relative min-w-[170px] md:min-w-[200px]">
                                <select
                                    className="appearance-none w-full bg-transparent shadow-sm focus:shadow-md 
                                    cursor-pointer border border-gray-300 rounded pl-3 pr-8 py-2 pt-3
                                    transition duration-300 ease focus:outline-none"
                                    value={selectedUser}
                                    onChange={handleSelectUserChange}
                                >   
                                    <option>All</option>
                                    {users?.map((user) => (
                                        <option key={user.user_id} value={user.user_id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>
                                <i 
                                    className="fa-solid fa-caret-down absolute right-2 top-3 text-xl cursor-pointer"              
                                ></i>
                            </div>
                        </div>
                        {/*Search*/}
                        <div 
                            className=" flex flex-row justify-center items-center
                            border border-gray-300 rounded"
                            >
                            <input
                                className="p-2 pl-4 focus:outline-none rounded w-full"
                                type="text"
                                value={searchByName}
                                onChange={(e) => setSearchByName(e.target.value)}
                                placeholder="Search by name..."
                            />

                            {/* <button 
                                className="px-3  h-full hover:bg-blue-500 hover:text-white 
                                hover:rounded-tr-sm hover:rounded-br-sm "
                                onClick={searchServerName}  
                            >
                                <i className="fa-solid fa-magnifying-glass text-xl font-bold"></i>
                            </button> */}
                        </div>
                    </div>
                    {/* Display List*/}
                    <div className="md:container lg:max-w-none mx-auto my-9 overflow-x-auto">
                        <table className={`${styles.serverTable} border w-full table-auto bg-white min-w-auto`}>
                            <thead >
                                <tr className="bg-slate-500">
                                    <th className="border px-3 py-3 text-lg">#</th>
                                    <th className="max-w-[200px] md:max-w-[350px] overflow-hidden truncate">Name Server</th>
                                    <th className="hidden md:table-cell">
                                        <div  className="flex flex-row items-center justify-center">
                                            <span>CPU<br/>Threshold</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("cpu_threshold", "asc")}
                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("cpu_threshold", "desc")}
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <div  className="flex flex-row items-center justify-center">
                                            <span>RAM<br/>Threshold</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("ram_threshold", "asc")}
                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("ram_threshold", "desc")}
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div> 
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <div  className="flex flex-row items-center justify-center ">
                                            <span>DISK<br/>Threshold</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("disk_threshold", "asc")}
                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("disk_threshold", "desc")}    
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div> 
                                    </th>
                                    <th className="hidden lg:table-cell">
                                        <div  className="flex flex-row items-center justify-center">
                                            <span>Failure<br/>Threshold</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("failure_threshold", "asc")}
                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("failure_threshold", "desc")}
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div> 
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <div  className="flex flex-row items-center justify-center">
                                            <span>CPU Count<br/>Threshold</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("cpu_count_threshold", "asc")}

                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("cpu_count_threshold", "desc")}
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div> 
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <div  className="flex flex-row items-center justify-center">
                                            <span>RAM Count<br/>Threshold</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("ram_count_threshold", "asc")}
                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("ram_count_threshold", "desc")}
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div> 
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <div  className="flex flex-row items-center justify-center">
                                            <span>DISK Count<br/>Threshold</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("disk_count_threshold", "asc")}
                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => handleSort("disk_count_threshold", "desc")}
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div> 
                                    </th>
                                    <th className="hidden md:table-cell">
                                        <div  className="flex flex-row items-center justify-center">
                                            <span>Channel</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => {handleSort("channel", "asc")}}
                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => {handleSort("channel", "desc")}}
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div> 
                                    </th>
                                    <th>
                                        <div  className="flex flex-row items-center justify-center">
                                            <span>Status</span>
                                            <div className="flex flex-col gap-0.5 leading-none ps-1">
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => {handleSort("status", "asc")}}
                                                >
                                                    <i className="fa-solid fa-caret-up"></i>
                                                </button>
                                                <button 
                                                    className="border border-gray-300 rounded px-0.5"
                                                    onClick={() => {handleSort("status", "desc")}}
                                                >
                                                    <i className="fa-solid fa-caret-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                                    
                            
                            <tbody>   
                                    {currentRows?.map((server) => (
                                        <tr key={server.server_id} className={`${styles.serverTableBody} hover:bg-slate-200`}>
                                            <th className="w-5">{server.server_id} </th>
                                            <th className="flex-1 max-w-[200px] md:max-w-[350px] overflow-hidden truncate">
                                                <a
                                                    className={`hover:cursor-pointer hover:text-blue-500 ps-2`}
                                                    onClick={() => openModalRead(server.server_id)}
                                                >
                                                    {server.name}
                                                </a>
                                            </th>
                                            <th className="hidden md:table-cell w-[104px]">{server.cpu_threshold}</th>
                                            <th className="hidden md:table-cell w-[104px]">{server.ram_threshold}</th>
                                            <th className="hidden md:table-cell w-[104px]">{server.disk_threshold}</th>
                                            <th className="hidden lg:table-cell w-[104px]">{server.failure_threshold}</th>
                                            <th className="hidden md:table-cell w-[120px]">{server.cpu_count_threshold}</th>
                                            <th className="hidden md:table-cell w-[120px]">{server.ram_count_threshold}</th>
                                            <th className="hidden md:table-cell w-[120px]">{server.disk_count_threshold}</th>
                                            <th className="hidden md:table-cell w-[92px]">{server.channel}</th>
                                            <th className="w-20">{server.status}</th>
                                            <th className="w-20">
                                                <div className="flex gap-1 justify-center">
                                                    <button 
                                                        className="border border-gray-300 rounded p-1 px-2
                                                                hover:bg-blue-500 hover:text-white hover:rounded"
                                                        onClick={() => openModalUpdate(server.server_id)}

                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button 
                                                        className="border border-gray-300 rounded p-1 px-2
                                                                hover:bg-red-500 hover:text-white hover:rounded"
                                                        onClick={() => openModalDelete(server.server_id)}
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
                            key={page}
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

            <ModalRead
                isOpen={showModalRead}
                serverId={currentServerId}
                onClose={closeModalRead}
            />
            <ModalUpdate
                isOpen={showModalUpdate}
                serverId={currentServerId}
                onClose={closeModalUpdate}
            />
            <ModalDelete
                isOpen={showModalDelete}
                serverId={currentServerId}
                onClose={closeModalDelete}
            />
        </div>
    )
}

export default ManagementServerPage