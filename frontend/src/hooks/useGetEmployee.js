import { getAllEmployees } from "@/redux/employeeSlice"
import { EMPLOYEES_API_END_POINT } from "@/utils/constants"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"


const useGetEmployees = () => {
    const dispatch = useDispatch()
    const { refresh } = useSelector((state) => state.employee);
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await axios.get(`${EMPLOYEES_API_END_POINT}/get-all-employee`, {
                    withCredentials: true,
                })
                console.log(res);
                dispatch(getAllEmployees(res.data.data))
            } catch (error) {
                console.error("Error fetching employees:", error);
                console.log(error);
            }
        }
        fetchEmployees()
    }, [refresh])
}

export default useGetEmployees