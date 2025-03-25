"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const URL_API = process.env.NEXT_PUBLIC_URL_API;
export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [name, setName] = useState("");
  const [picture, setPicture] = useState("")

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  
  // useEffect(() => {
  //   // checkToken();
  //   const token = localStorage.getItem("access_token");
  //   console.log("Token local: ",token);
  //   const id = localStorage.getItem("id");
  //   console.log("ID local: ",id);
  //   if (!token) {
  //     router.push("/login");
  //   } else {
  //     fetch(`${URL_API}/user/${id}`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json"
  //       },
  //     })
  //     .then((res) => {
  //       console.log("Reponse----",res); 
  //       if (res.status == 401 ) {
  //         router.push("/login");
  //         localStorage.clear();
  //       }
  //         else return res.json();})
  //     .then((data) => {console.log("Data",data);})
  //     .catch((error) => {console.log(error);});
  //   }
  //   console.log("pathname",pathname);
  // },[pathname]);

  const handleLogout = () => {
    fetch(`${URL_API}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
    })
        .then(res => res.json())
        .then(data => {
          router.push("/login");
          console.log(data)
        })
        .catch((err) => console.log(err));

  }
  useEffect(()=>{
    fetch(`${URL_API}/protected`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
    })
        .then(res => {
          if (res.status == 401) {
            router.push("/login");
            return Promise.reject("unauthorized");
          }
          else
            return res.json()
        })
        .then(data => {
          console.log("Timeout: ", data.timeout)
          setName(data.name)
          setPicture(data.picture)
          

          const timeout = setTimeout(() => {
            fetch(`${URL_API}/logout`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json"
              },
            })
                .then(res => {
                  if (res.status == 200) {router.push("/login");
                    }
                  if (res.status == 404 ){
                    router.push("/login")
                  }
                  return res.json()
                })
                .then(data => console.log("data logout: ",data))
                .catch((err) => console.log(err));
          }, (data.timeout-1000));
          return () => clearTimeout(timeout);

        })
        .catch(err => console.log(err));
  }, [router])
  // const handleDelete = () => {
  //   fetch(`${URL_API}/server/delete`, {
  //     method: "POST",
  //     credentials: "include",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //   })
  //       .then(res => res.json())
  //       .then(data => {console.log("DELETE: ",data)})
  //       .catch((err) => console.log(err));
  // }
  return (
    <div className="flex">
      {/* Sidebar */}


      <button type="button" title="Toggle sidebar" onClick={() => {
        setIsCollapsed(false);
        setIsOpen(!isOpen)
      }}
              className={`md:hidden absolute left-[0px] top-[0px] z-50  justify-center  ${isOpen ? isCollapsed ? "left-[60px]" : "left-[183px]" : null}`}>
        <div className="h-[25px] w-[25px] bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-[0px] ">
          <svg className="h-4 w-4 dark:text-gray-100 text-gray-700" viewBox="0 0 24 24" fill="none"
               stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </div>

      </button>
      <aside
          className={`${isCollapsed ? "w-16" : "w-52"} ${isOpen ? "block" : "hidden"} left-0 top-0 min-h-screen absolute md:relative z-50 md:block bg-gray-100  md:rounded-tr-md rounded-br-[5px] text-gray-700 p-0 font-mts shadow-md dark:text-gray-100 dark:bg-gray-700`}>
        <nav className={`${isCollapsed ? "w-16" : "w-52"} fixed`}>
          <ul className={""}>
            <li className={"relative h-[28px] items-center"}>
              <button type="button" title="Toggle sidebar" onClick={() => setIsCollapsed(!isCollapsed)}
                      className={"absolute right-[-0px] top-[0px]  justify-center hidden md:block"}>
                <div className="h-[25px] w-[25px] bg-gray-100 dark:bg-gray-700 flex items-center justify-center  ">
                  <svg className="h-4 w-4 dark:text-gray-100 text-gray-700" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </div>

              </button>
            </li>
            <li className="flex items-center border-b-gray-400 border-b h-14 justify-center pb-2  ">
              <svg className={`${isCollapsed ? "h-10 w-10" : "h-5 w-5"} dark:text-gray-100 text-gray-700`} fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              {!isCollapsed && <h1 className="font-black ml-2 text-2xl">DASHBOARD</h1>}
            </li>

            {!isCollapsed? (<li className={"mt-2 flex items-center justify-center"} >

<input  type="text" placeholder="Search" className="w-3/5 rounded-md pl-[10px] h-[40px] mr-[10px]"/>
<button title="Search" >
  <svg className="h-6 w-6 text-gray-700 dark:text-gray-100"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round">  <circle cx="11" cy="11" r="8" />  <line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
</button>
</li>): null}
            
            {/*User*/}
            <li className={"flex h-20 items-center  justify-center mt-3"}>
              <div className={`${isCollapsed? "flex w-[44px] h-[44px]": "flex w-[66px] h-[66px] ml-4 " } bg-white justify-center items-center rounded-full shadow-2xl`}>
                {picture? <Image className="rounded-full" width={isCollapsed?40:60} height={isCollapsed?40:60} src={picture} alt={"userImage"}></Image> : 
                (
                  <div role="status">
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                )
                }
                
              </div>
              {!isCollapsed &&
                (<div className={"ml-4 w-[100px]"}>
                  <p className={"font-[600] text-base"}>{name}</p>
                </div>)}

            </li>

            <li className={"mt-2"}>
              <Link href="/dashboard/chart" className="block group">
                <div
                    tabIndex={0}
                    className={`${isCollapsed ? "justify-center " : "pl-[22px] "} relative group-focus-within:bg-violet-100 flex items-center  h-10 cursor-pointer text-gray-700 dark:text-gray-100 group-focus-within:text-violet-600`}
                >
                  {/* <svg className={`${isCollapsed? "h-7 w-7" : "h-5 w-5"} `} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg> */}
                  <svg className={`${isCollapsed? "h-8 w-8" : "h-6 w-6"} `}  width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="4" y1="19" x2="20" y2="19" />  <polyline points="4 15 8 9 12 11 16 6 20 10" /></svg>
                  
                  {!isCollapsed && <span className="block py-2 font-[600] text-base ml-2 ">Chart</span>}

                  <div className={"w-1 h-5 absolute right-0 group-focus-within:bg-violet-600 ml-auto rounded-l-[4px]"}>

                  </div>
                </div>
              </Link>
            </li>
            <li className={"mt-2 border-b border-b-gray-400 pb-2"}>
              <Link href="/dashboard/server" className="block group">

                <div
                    tabIndex={0}
                    className={`${isCollapsed ? "justify-center " : "pl-6 "} relative group-focus-within:bg-violet-100 flex items-center  h-10 cursor-pointer text-gray-700 dark:text-gray-100 group-focus-within:text-violet-600`}
                >
                  <svg className={`${isCollapsed? "h-7 w-7": "h-5 w-5"} `} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                    <line x1="6" y1="6" x2="6.01" y2="6"/>
                    <line x1="6" y1="18" x2="6.01" y2="18"/>
                  </svg>

                  {!isCollapsed && <span className="block py-2 font-[600] text-base ml-2 ">Server config</span>}

                  <div className={"w-1 h-5 absolute right-0 group-focus-within:bg-violet-600 ml-auto rounded-l-[4px]"}>

                  </div>
                </div>
              </Link>
            </li>
            <li >
              <button onClick={handleLogout} className={`${isCollapsed? "justify-center  ": "pl-6 "}: w-full h-10 flex mt-2 items-center`}>
                <svg className={`${isCollapsed? "h-7 w-7" : "h-5 w-5"}text-gray-700 dark:text-gray-100`} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                { !isCollapsed? <p className={"ml-2 font-mts  font-[600]"}>Log out</p> : null}

              </button>
            </li>

            <li className={"mt-2"}>
              <div onClick={() => setDarkMode(!darkMode)}
                   className={`${isCollapsed ? "justify-center " : "pl-6 pr-6 justify-between "}: h-10 flex  items-center  `}>
                {!isCollapsed ? <p className={"ml-0 font-mts font-[600]"}>Dark mode</p> : null}
                {!darkMode ? (
                    !isCollapsed ? (
                        <svg className="h-6 w-6 text-gray-700 dark:text-gray-100" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
                          <circle cx="16" cy="12" r="3"/>
                        </svg>
                    ) : (<svg className="h-8 w-8 text-gray-700 dark:text-gray-100" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>)

                ) : (
                    !isCollapsed ? (
                        <svg className="h-6 w-6 text-gray-700 dark:text-gray-100" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
                          <circle cx="8" cy="12" r="3"/>
                        </svg>
                    ) : (
                        <svg className="h-8 w-8 text-gray-700 dark:text-gray-100" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    )

                )}
              </div>
              {/*<button onClick={handleDelete} className={"w-[20px] h-[20px] bg-violet-600"}>*/}
              {/*  <i className="fa-solid fa-gauge"></i>*/}
              {/*</button>*/}


            </li>


          </ul>
        </nav>
      </aside>

      {/* Nội dung trang */}
      <main className="flex-1 p-6">
        {children} {/* Hiển thị nội dung của trang con */}
      </main>
    </div>
  );
}

