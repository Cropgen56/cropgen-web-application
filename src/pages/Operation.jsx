import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import OperationSidebar from "../components/operation/operationsidebar/OperationSidebar";
import Calendar from "../components/operation/operationcalender/OperationCalender";
import { useNavigate } from "react-router-dom";
import SimpleLoader from "../components/comman/loading/SimpleLoader";
import FieldDropdown from "../components/comman/FieldDropdown";
import FeatureGuard from "../components/subscription/FeatureGuardComponent";
import { useSubscriptionGuard } from "../components/subscription/hooks/useSubscriptionGuard";
import { Sprout, Plus } from "lucide-react";

const Operation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields);
  const userId = user?.id;

  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

  const subscriptionGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "farmOperationsManagement",
  });

  if (fields?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-br from-[#344e41] to-[#2b4035] text-center px-6">
        <SimpleLoader
          size="lg"
          variant="brandMark"
          className="mb-8 h-44 w-44 sm:h-52 sm:w-52"
        />
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
          <Sprout className="text-white/80" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Farms Yet</h2>
        <p className="text-white/60 text-sm max-w-md mb-6">
          Add a farm field to start scheduling tillage, sowing, spraying, and other operations.
        </p>
        <button
          onClick={() => navigate("/addfield")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-ember-sidebar font-semibold hover:bg-emerald-50 transition shadow-lg"
        >
          <Plus size={18} />
          Add Farm Field
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#344e41]">
      {/* Desktop farm sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <OperationSidebar
          setSelectedField={setSelectedField}
          selectedField={selectedField}
        />
      </div>

      {/* Main panel — single scroll container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <div className="lg:hidden shrink-0 z-20 bg-[#344e41] px-3 py-2.5 border-b border-white/10">
          <p className="text-emerald-100/70 text-[10px] uppercase tracking-wider font-semibold mb-1.5">
            Farm Operations
          </p>
          <FieldDropdown
            fields={fields}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />
        </div>

        <div className="operations-page-content flex-1 min-h-0 overflow-hidden">
          <FeatureGuard
            guard={subscriptionGuard}
            title="Farm Operations Management"
          >
            <Calendar
              selectedField={selectedField?._id}
              fieldName={selectedField?.fieldName}
            />
          </FeatureGuard>
        </div>
      </div>
    </div>
  );
};

export default Operation;
