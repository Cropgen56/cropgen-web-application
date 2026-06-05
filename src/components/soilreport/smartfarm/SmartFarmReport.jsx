import React from "react";
import SoilHealthReportView from "../SoilHealthReportView";
import {
  SmartFarmReportEmptyState,
  ReportBuildProgress,
} from "./ReportWorkspace";

export default function SmartFarmReport({
  reportData,
  selectedField,
  user,
  reportRef,
  onDownloadPdf,
  isDownloading,
  onGenerateReport,
  isGeneratingReport = false,
}) {
  const field = reportData?.field || selectedField;
  const soilReport = reportData?.soilReport || null;

  if (!field) {
    return (
      <SmartFarmReportEmptyState
        selectedField={selectedField}
        isDesktop={
          typeof window !== "undefined"
            ? window.matchMedia("(min-width: 1024px)").matches
            : true
        }
        onGenerateReport={onGenerateReport}
        isGeneratingReport={isGeneratingReport}
      />
    );
  }

  if (isGeneratingReport) {
    const fieldLabel = field.fieldName || field.farmName || "Selected field";

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <ReportBuildProgress
          fieldLabel={fieldLabel}
          ringOk={Array.isArray(field?.field) && field.field.length >= 3}
          loadingSatelliteDates={true}
          datesReady={false}
          analysisDate=""
          indicesLoadedCount={0}
          indicesTotal={1}
          anyIndexLoading={true}
          aiRunning={false}
          aiError={false}
          isComplete={false}
          timedProgressDuration={120000}
        />
      </div>
    );
  }

  if (!soilReport) {
    return (
      <SmartFarmReportEmptyState
        selectedField={selectedField}
        isDesktop={
          typeof window !== "undefined"
            ? window.matchMedia("(min-width: 1024px)").matches
            : true
        }
        onGenerateReport={onGenerateReport}
        isGeneratingReport={false}
      />
    );
  }

  return (
    <SoilHealthReportView
      data={soilReport}
      field={field}
      user={user}
      generatedAt={reportData?.generatedAt}
      reportRef={reportRef}
      onDownloadPdf={onDownloadPdf}
      isDownloading={isDownloading}
    />
  );
}