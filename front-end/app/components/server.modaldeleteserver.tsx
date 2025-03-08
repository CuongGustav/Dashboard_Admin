import { useState, useEffect, useCallback } from "react";

interface ServerModalDeleteServerProps {
    isOpen: boolean;
    serverId: number | null;
    onClose(): void
}

const ServerModalDeleteServer: React.FC<ServerModalDeleteServerProps> = ({ isOpen, serverId, onClose }) => {

    const [inforServer, setInforServer] = useState<Server | null>(null);

    const getInforServer = useCallback(async () => {
        if (serverId) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/serverAdmin/Server/${serverId}`);
                const data= await response.json();
                setInforServer(data);
            } catch (error) {
                console.error('Error fetching server data:', error);
            }
        }
    }, [serverId]);

    useEffect(() => {
        getInforServer()
    }, [serverId, getInforServer])


    const handleSubmit = async () => {
        if(serverId){
            try{
                await fetch (`http://127.0.0.1:5000/serverAdmin/Server/${serverId}`,{
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
                <h2 className="text-xl mb-4">Do you want delete server {inforServer?.name}?</h2>
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