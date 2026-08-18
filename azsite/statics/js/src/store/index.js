import { create } from "zustand";
import { removeCookie } from "../utils/helpers/cookie";

const useStore = create((set) => ({
    accessToken: null,

    setState: (data) =>
        set({
            accessToken: data?.accessToken,
        }),

    logout: async () => {
        await removeCookie("origins");

        set({ accessToken: null });

        localStorage.removeItem('authToken');
    },
}));

export default useStore;