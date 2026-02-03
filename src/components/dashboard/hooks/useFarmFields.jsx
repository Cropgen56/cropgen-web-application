import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../../../redux/slices/farmSlice";

export const useFarmFields = () => {
  const dispatch = useDispatch();

  const userId = useSelector((state) => state?.auth?.user?.id);
  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const isLoading = useSelector((state) => state?.farmfield?.loading ?? false);

  const fields = useMemo(() => fieldsRaw || [], [fieldsRaw]);

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  return { fields, isLoadingFields: isLoading };
};
