import { useState, useEffect, useReducer, useContext } from "react";
import axios from "axios";

import UserContext from "../context/UserContext";

function dataFetchReducer(state, action) {
    switch (action.type) {
        case "FETCH_INIT":
            return {
                ...state,
                isLoading: true,
                isError: false
            };
        case "FETCH_SUCCESS":
            return {
                isLoading: false,
                isError: false,
                data: action.payload
            };
        case "FETCH_FAILURE":
            return {
                ...state,
                isLoading: false,
                isError: true
            };
        default:
            throw new Error();
    }
}

function useDataFetch(initialUrl, initialData) {
    const { userInfo } = useContext(UserContext);
    const [url, setUrl] = useState(initialUrl);
    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData
    });

    useEffect(() => {
        let didCancel = false;

        const fetchData = async () => {
            dispatch({ type: "FETCH_INIT" });

            try {
                const config = userInfo.isLogin ? { headers: { Authorization: `Bearer ${userInfo.tokenId}` } } : undefined;
                const result = config !== undefined ? await axios.get(url, config) : await axios.get(url);
                if (process.env.NODE_ENV !== "production") console.log("dataFetch", url, result.data);
                if (!didCancel)
                    dispatch({ type: "FETCH_SUCCESS", payload: result.data });
            } catch (error) { /** include 40x */
                if (!didCancel) {
                    console.log(`error in data fetch about ${url}\n`, error);
                    dispatch({ type: "FETCH_FAILURE" });
                }
            }
        };

        if (url !== "initialUrl")
            fetchData();

        return () => {
            didCancel = true;
            if (process.env.NODE_ENV !== "production") console.log('unmount hooks', url);
        };
    }, [url, userInfo]);

    return [state, setUrl];
}

export default useDataFetch;