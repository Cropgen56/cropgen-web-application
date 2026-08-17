import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import FieldDropdown from "../components/comman/FieldDropdown";
import SimpleLoader from "../components/comman/loading/SimpleLoader";
import ZoningSection from "../components/dashboard/mapview/zoning/ZoningSection";
import { getFarmFields } from "../redux/slices/farmSlice";

const Zoning = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const rawFields = useSelector((state) => state?.farmfield?.fields);
  const fields = useMemo(() => rawFields || [], [rawFields]);
  const userId = user?.id;

  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    if (userId) dispatch(getFarmFields(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-ember-surface text-center px-4">
        <SimpleLoader
          size="lg"
          variant="brandMark"
          className="mb-8 h-44 w-44 sm:h-52 sm:w-52"
        />

        <h2 className="text-2xl font-semibold text-white">
          Add Farm to See the Zoning Analysis
        </h2>

        <button
          type="button"
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 rounded-lg bg-white text-ember-surface font-medium hover:bg-gray-200 transition"
        >
          Add Field
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#f3f6f4] p-3 lg:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Zoning</h1>
        <FieldDropdown
          fields={fields}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
        />
      </div>

      <ZoningSection selectedFieldDetails={selectedField} />
    </div>
  );
};

export default Zoning;
