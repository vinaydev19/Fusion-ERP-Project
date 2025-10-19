import { getOtherUsers } from "@/redux/userSlice";
import { USER_API_END_POINT } from "@/utils/constants";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const useGetOtherUsers = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchOtherUsers = async () => {
            try {
                const res = await axios.get(`${USER_API_END_POINT}/other-users`,{
                    withCredentials:true
                });
                dispatch(getOtherUsers(res.data.users));
            } catch (error) {
            }
        }
        fetchOtherUsers();
    },[]);
};
export default useGetOtherUsers;