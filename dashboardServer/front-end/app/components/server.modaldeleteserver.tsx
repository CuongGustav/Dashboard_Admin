import { useState, useEffect, useCallback } from "react";

interface ServerModalDeleteServerProps {
    isOpen: boolean;
    serverName: string | null;
    onClose(): void
}
const backEndAPI = process.env.NEXT_PUBLIC_API_BASE_URL;

const ServerModalDeleteServer: React.FC<ServerModalDeleteServerProps> = ({ isOpen, serverName, onClose }) => {

    const [inforServer, setInforServer] = useState<ServerJson | null>(null);

    const getInforServer = useCallback(async () => {
        if (serverName) {
            try {
                const response = await fetch(`${backEndAPI}/serverAdmin/GetServerByNameJSON?servername=${serverName}`);
                const data= await response.json();
                setInforServer(data);
            } catch (error) {
                console.error('Error fetching server data:', error);
            }
        }
    }, [serverName]);

    useEffect(() => {
        getInforServer()
    }, [serverName, getInforServer])


    const handleSubmit = async () => {
        if(serverName){
            try{
                await fetch (`${backEndAPI}/serverAdmin/DeleteServerByNameJSON?servername=${serverName}`,{
                    method: "DELETE",
                    headers: { 'Content-Type': 'application/json' },
                })
                onClose()
                window.location.reload()
            } catch (error) {
                console.log("error:", error)
            }
        } else {
            console.error("Server ID is missing");
            return;
        }
    }

    if (!isOpen) return null; 

    return (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg w-[300px] flex flex-col items-center">
                <h2 className="text-xl mb-4">Do you want delete server {inforServer?.server_name}?</h2>
                <div className="flex gap-4">
                    <button
                        className="border border-gray-300 rounded p-1 px-2
                        hover:bg-red-500 hover:text-white hover:rounded"
                        onClick={handleSubmit}
                    >
                        Yes
                    </button>
                    <button
                        className="border border-gray-300 rounded p-1 px-2
                        hover:bg-blue-500 hover:text-white hover:rounded"
                        onClick={onClose}
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};


export default ServerModalDeleteServer