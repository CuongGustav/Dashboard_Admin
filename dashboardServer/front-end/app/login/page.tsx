"use client"


import {useState, useEffect} from "react";
import { useRouter, useSearchParams } from "next/navigation";
const URL_API = process.env.NEXT_PUBLIC_URL_API;
export default function LoginPage() {
    
    const searchParams = useSearchParams(); 
    const [messageErr, setMessageErr] = useState("");
    const [loading, setLoading] = useState(true);
    const [fail, setFail] = useState(false)
    const router = useRouter();
    // const handleLogin = () => {
    //     fetch (`${URL_API}/login`,{
    //         method: "POST",
    //         credentials: "include",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ username, password }),
    //     })
    //         .then((res) => {

    //             if (res.status === 200) {
    //                 router.push("/dashboard/chart")
    //                 return res.json()
    //             }
    //             if (res.status === 404) {
    //                 return res.json().then((data)=>{

    //                     setMessageErr(data.message);
                        
    //                 })
    //             }
    //             if (res.status === 429) {
    //                 return res.json().then((data)=>{
    //                     setMessageErr(data.error);
                        

    //                 })
    //             }

    //         })
    //         .then((data) => {console.log(data)})

    //         .catch((err) => {
    //             setMessageErr(err.message);
                
    //             setTimeout(() => {
    //             }, 3000);
    //         })
    // }
    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) setLoading(false);

        if (code) {
            fetch(`${URL_API}/auth/callback`,{
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            })
                .then((res) => {
                    if (res.status == 200) {
                        console.log("Login success, redirecting to /dashboard/chart...");
                        router.push("dashboard/chart")
                    }
                    if (res.status === 404) {
                        router.push("/login");
                        return res.json().then((data)=>{

                            setMessageErr(data.message);
                            setFail(true)
                            setTimeout(() => setFail(false), 3000);
                            console.log(messageErr)
                        })

                    }
                })
                .catch((error) => console.log(error))
        }
      }, [searchParams,messageErr, router]);


    const handleGoogleLogin = () => {
        fetch (`${URL_API}/google-login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => {return res.json()})
            .then((data) => {
                console.log(data);
                window.location.href = data
            })
            .catch((err) => {console.log(err)})
      };

    if (loading) return (
        <div className={`h-screen w-full justify-center items-center flex`}>
            <div role="status">
                <svg aria-hidden="true" className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-gray-700"
                     viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"/>
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        </div>)
    else
        return (
            <div className=" flex flex-col bg-white h-screen items-center justify-center">
                {fail ? (
                    <div className="bg-red-100 border border-red-400 text-red-600 px-4 py-3 rounded absolute top-1" role="alert">
                    
                    <span className="block sm:inline font-mts text-[16px] text-[800]">{messageErr}</span>
                    
                    </div>
                ) : null}
                <h1 className="text-[40px] font-mts font-[700] text-gray-700 mb-[30px]">CODE COMPLETE</h1>   
                <button onClick={handleGoogleLogin}
                    title="Sign in with google"
                    className={` w-[280px] h-[45px] items-center flex mt-[20px] bg-blue-500 hover:bg-gray-700 mb-[100px] rounded-[8px]  shadow-lg `}>
                    <i className="pl-[10px] pt-[0px] fa-brands fa-google text-white text-[25px]"></i>
                    <p className="font-mts font-bold text-[14px] text-white text-center pl-[50px]">Sign in with Google</p>
                </button>  
        </div>
    )
}