"use client"

import axios from "@/configs/axios.mjs";
import { createContext, useEffect, useState } from "react"

const AttendanceContext = createContext()

function AttendanceContextProvider({children}) {
    const [token, setToken] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {        
        const tokenFromStorage = localStorage.getItem("token");
        setToken(tokenFromStorage || "");
    }, [])

    useEffect(() => {
        if (token) {
            sessionStorage.setItem("fetchAttendanceTimeStamp", new Date());
            fetchApi();
        }
    }, [token]);

    const fetchApi = async () => {
        try {
            setData([])
            const rs = await axios.get("/public/fetchDataAllAttendanceRecord", {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (rs.status === 200) {
                setData(rs.data.data);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false)
        }
    };

    const value = { data, setData, loading, setLoading, fetchApi, token };

    return (
        <AttendanceContext.Provider value={value}>
            {children}
        </AttendanceContext.Provider>
    )
}

export { AttendanceContextProvider };
export default AttendanceContext;