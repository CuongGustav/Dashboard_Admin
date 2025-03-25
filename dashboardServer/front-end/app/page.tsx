'use client'
import {useRouter} from "next/navigation";
import {useEffect} from "react";
// import {useEffect} from "react";
const URL_API = process.env.NEXT_PUBLIC_URL_API;

export default function Home() {
  const router = useRouter();
  useEffect(()=>{
    fetch(`${URL_API}/protected`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
    })
        .then(res => {
          console.log("status: ", res.status);
          if (res.status == 401) {
              router.push("/login");
              return Promise.reject("Unauthorized");
          }
          else
            return res.json()
        })
        .then(data => {
          //   console.log("HEHEHHE")
          // const limit = new Date(data.user).getTime();
          // const now = Date.now();

          if (data.timeout > 0) {
            console.log("time out: ", data.timeout);
            router.push("/dashboard/chart")
          }
          else {
            fetch(`${URL_API}/logout`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json"
              },
            })
                .then(res => {
                  if (res.status == 200) router.push("/login");
                  return res.json()
                })
                .then(data => console.log("data logout: ",data))
                .catch((err) => console.log(err));
          }


        })
        .catch(err => console.log(err));
  },[router])

}
