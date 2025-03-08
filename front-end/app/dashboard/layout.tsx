"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";


export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <button type="button" title="Toggle sidebar" onClick={()=> { setIsCollapsed(false) ; setIsOpen(!isOpen)}} className={`md:hidden absolute left-[0px] top-[0px] z-50  justify-center  ${isOpen? isCollapsed? "left-[60px]" : "left-[183px]" : null}`}>
                <div className="h-[25px] w-[25px] bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-[0px] ">
                  <svg className="h-4 w-4 dark:text-gray-100 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
      </div>

        </button>
      <aside className={`${isCollapsed ? "w-16" : "w-52"} ${isOpen? "block" : "hidden"} left-0  absolute h-full md:relative md:block bg-gray-100 z-40 md:rounded-tr-md rounded-br-[5px] text-gray-700 p-0 font-mts shadow-md dark:text-gray-100 dark:bg-gray-700`}>
        <nav>
          <ul className={""}>
            <li className={"relative h-[28px] items-center"}>
              <button type="button" title="Toggle sidebar" onClick={()=> setIsCollapsed(!isCollapsed)} className={"absolute right-[-0px] top-[0px]  justify-center hidden md:block"}>
                <div className="h-[25px] w-[25px] bg-gray-100 dark:bg-gray-700 flex items-center justify-center  ">
                  <svg className="h-4 w-4 dark:text-gray-100 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </div>

              </button>
            </li>
            <li className="flex items-center border-b-gray-400 border-b h-14 justify-center pb-2  ">
              <svg className={`${isCollapsed? "h-10 w-10" : "h-5 w-5"} dark:text-gray-100 text-gray-700`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
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
            <li className={"flex h-20 items-center   justify-center mt-3"}>
              <div className={`${isCollapsed? "flex w-[44px] h-[44px]": "flex w-[66px] h-[66px]" } bg-white justify-center items-center rounded-full shadow-2xl`}>
                <Image className="rounded-full" width={isCollapsed?40:60} height={isCollapsed?40:60} src={"/cena.png"} alt={"userImage"}></Image>
              </div>
              {!isCollapsed &&
                (<div className={"ml-4"}>
                  <p className={"font-medium text-base"}>Việt Trung</p>
                  <p className={"font-extralight text-sm"}>Developer</p>
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
                  
                  {!isCollapsed && <span className="block py-2 font-normal text-base ml-2 ">Chart</span>}

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

                  {!isCollapsed && <span className="block py-2 font-normal text-base ml-2 ">Server config</span>}

                  <div className={"w-1 h-5 absolute right-0 group-focus-within:bg-violet-600 ml-auto rounded-l-[4px]"}>

                  </div>
                </div>
              </Link>
            </li>
            <li >
              <div className={`${isCollapsed? "justify-center  ": "pl-6 "}: h-10 flex mt-2 items-center `}>
                <svg className={`${isCollapsed? "h-7 w-7" : "h-5 w-5"}text-gray-700 dark:text-gray-100`} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                { !isCollapsed? <p className={"ml-2"}>Log out</p> : null}

              </div>
            </li>

            <li className={"mt-2"}>
              <div onClick={()=>setDarkMode(!darkMode)} className={`${isCollapsed? "justify-center ": "pl-6 pr-6 justify-between "}: h-10 flex  items-center  `}>
                { !isCollapsed? <p className={"ml-0"}>Dark mode</p> : null}
                {!darkMode? (
                    !isCollapsed? (
                        <svg className="h-6 w-6 text-gray-700 dark:text-gray-100"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round">  <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />  <circle cx="16" cy="12" r="3" /></svg>
                    ) : (<svg className="h-8 w-8 text-gray-700 dark:text-gray-100" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
                    !isCollapsed? (
                        <svg className="h-6 w-6 text-gray-700 dark:text-gray-100" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
                          <circle cx="8" cy="12" r="3"/>
                        </svg>
                    ): (
                        <svg className="h-8 w-8 text-gray-700 dark:text-gray-100" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    )

                )}
              </div>


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

