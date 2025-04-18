import { getAllCustomers } from "@/redux/customerSlice"
import { CUSTOMERS_API_END_POINT } from "@/utils/constants"
import axios from "axios"
import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

const useGetCustomers = () => {
    const dispatch = useDispatch()
    const { refresh } = useSelector((state) => state.customers)

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get(`${CUSTOMERS_API_END_POINT}/get-all-customer`, { withCredentials: true })
                console.log(res);
                dispatch(getAllCustomers(res.data.data))
            } catch (error) {
                console.error("Error fetching customer:", error);
                console.log(error);
            }
        }
        fetchCustomers()
    }, [refresh])
}

export default useGetCustomers