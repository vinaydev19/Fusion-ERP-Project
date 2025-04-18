import { getAllDeliveries } from "@/redux/deliverieSlice"
import { DELIVERIES_API_END_POINT } from "@/utils/constants"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"


const useGetDeliveries = () => {
    const dispatch = useDispatch()
    const { refresh } = useSelector((state) => state.deliveries);
    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                const res = await axios.get(`${DELIVERIES_API_END_POINT}/get-all-delivery`, {
                    withCredentials: true,
                })
                console.log(res);
                dispatch(getAllDeliveries(res.data.data))
            } catch (error) {
                console.error("Error fetching deliveries:", error);
                console.log(error);
            }
        }
        fetchDeliveries()
    }, [refresh])
}

export default useGetDeliveries