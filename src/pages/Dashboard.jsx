import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import MapView from "../components/dashboard/mapview/MapView";
import CropHealth from "../components/dashboard/crophealth/CropHealthCard";
import ForeCast from "../components/dashboard/forecast/ForeCast";
import PlantGrowthActivity from "../components/dashboard/plantgrowthactivity/PlantGrowthActivity";
import Insights from "../components/dashboard/insights/Insights";
import CropAdvisory from "../components/dashboard/cropadvisory/CropAdvisory";
import "../style/Dashboard.css";
import NdviGraph from "../components/dashboard/satellite-index/vegitation-index/VegetationIndex";
import WaterIndex from "../components/dashboard/satellite-index/water-index/WaterIndex";

// Constants
const SELECTED_FIELD_KEY = "selectedFieldId";

const Dashboard = () => {
    const dispatch = useDispatch();

    // Memoized selectors to prevent unnecessary re-renders
    const user = useSelector((state) => state?.auth?.user);
    const fields = useSelector((state) => state?.farmfield?.fields);
    const userId = user?.id;

    // State management
    const [markers, setMarkers] = useState([]);
    const [isAddingMarkers, setIsAddingMarkers] = useState(false);
    const [selectedField, setSelectedField] = useState(() => {
      return localStorage.getItem(SELECTED_FIELD_KEY) || "";
    });

    const [prevFieldsLength, setPrevFieldsLength] = useState(0);

    // Memoized computed values
    const selectedFieldDetails = useMemo(() => {
        return fields.find((item) => item?._id === selectedField) || null;
    }, [fields, selectedField]);

    // Memoized callback for field selection
    const handleFieldSelection = useCallback((fieldId) => {
        setSelectedField(fieldId);
        localStorage.setItem(SELECTED_FIELD_KEY, fieldId);
    }, []);

    // Fetch fields on component mount - only when userId changes
    useEffect(() => {
        if (userId) {
        dispatch(getFarmFields(userId));
        }
    }, [dispatch, userId]);

    // Optimized field selection logic
    useEffect(() => {
        if (fields.length === 0) return;

        const isNewFieldAdded =
        fields.length > prevFieldsLength && prevFieldsLength > 0;

        const isInitialLoad = !selectedField && prevFieldsLength === 0;

        // Always select the latest field when a new one is added
        if (isNewFieldAdded) {
        const latestField = fields[fields.length - 1]?._id;
        if (latestField) {
            handleFieldSelection(latestField);
        }
        } else if (isInitialLoad) {
        const latestField = fields[fields.length - 1]?._id;
        if (latestField) {
            handleFieldSelection(latestField);
        }
        }

        setPrevFieldsLength(fields.length);
    }, [fields, prevFieldsLength, selectedField, handleFieldSelection]);

    // Memoized props objects to prevent unnecessary re-renders
    const mapViewProps = useMemo(
        () => ({
        markers,
        setMarkers,
        isAddingMarkers,
        setIsAddingMarkers,
        selectedField,
        setSelectedField: handleFieldSelection,
        selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
        fields,
        }),
        [
        markers,
        isAddingMarkers,
        selectedField,
        handleFieldSelection,
        selectedFieldDetails,
        fields,
        ]
    );

    const cropHealthProps = useMemo(
        () => ({
        selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
        fields,
        }),
        [selectedFieldDetails, fields]
    );

    const ndviGraphProps = useMemo(
        () => ({
        selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
        }),
        [selectedFieldDetails]
    );

    const cropAdvisoryProps = useMemo(
        () => ({
        selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
        }),
        [selectedFieldDetails]
    );

    const plantGrowthProps = useMemo(
        () => ({
        selectedFieldsDetials: selectedFieldDetails ? [selectedFieldDetails] : [],
        }),
        [selectedFieldDetails]
    );

    return (
        <div className="dashboard float-end p-1.5 lg:p-3">
            <MapView {...mapViewProps} />

            {fields.length > 0 && (
                <>
                    <CropHealth {...cropHealthProps} />
                    <ForeCast />
                    <NdviGraph {...ndviGraphProps} />
                    <WaterIndex {...ndviGraphProps} />
                    <Insights />
                    <CropAdvisory {...cropAdvisoryProps} />
                    <PlantGrowthActivity {...plantGrowthProps} />
                </>
            )}
            
        </div>
    );
};

export default React.memo(Dashboard);
