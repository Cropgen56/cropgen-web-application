import { clear } from "idb-keyval";

export const logoutUser = async () => {
  try {
    await clear();
    localStorage.clear();
    console.log("Logged out: IDB + localStorage + Redux state cleared.");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
