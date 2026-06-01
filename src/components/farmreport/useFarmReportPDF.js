import { useState, useCallback } from "react";
import { message } from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import store from "../../redux/store";
import { fetchForecastData } from "../../redux/slices/weatherSlice";
import { APP_NAME, APP_SITE_URL, APP_TAGLINE } from "../../config/brand";

const PDF_CAPTURE_WIDTH = 1200;

// Dark Green Theme
const DARK_GREEN = {
  primary: [20, 83, 45],        // Dark green
  secondary: [15, 65, 35],      // Darker green
  accent: [34, 197, 94],        // Medium green
  text: [240, 253, 250],        // Light text
  textMuted: [156, 163, 175],   // Muted text
  background: [31, 41, 55],     // Very dark gray
};

const useFarmReportPDF = (selectedFieldDetails, aoiId = null) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPreparedForPDF, setIsPreparedForPDF] = useState(false);

  const PDF_CONFIG = {
    MARGIN_LEFT: 10,
    MARGIN_RIGHT: 10,
    HEADER_HEIGHT: 14,
    FOOTER_HEIGHT: 10,
    SECTION_TITLE_HEIGHT: 8,
    SECTION_GAP: 5,
    CONTENT_PADDING: 2,
  };

  const getLogoBase64 = useCallback(async () => {
    try {
      const response = await fetch("/favicon.png");
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result.split(",")[1]; // Remove data:image/png;base64, prefix
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("Could not load logo:", error);
      return null;
    }
  }, []);

  const captureLeafletMapsToImages = useCallback((element) => {
    return new Promise((resolve) => {
      try {
        const mapContainers = element.querySelectorAll(".leaflet-container");

        if (mapContainers.length === 0) {
          resolve();
          return;
        }

        const processedSnapshots = [];

        mapContainers.forEach((mapContainer, index) => {
          try {
            const canvases = mapContainer.querySelectorAll("canvas");
            const svgs = mapContainer.querySelectorAll("svg");
            const rect = mapContainer.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) {
              console.warn("Map container has zero dimensions");
              return;
            }

            const compositeCanvas = document.createElement("canvas");
            compositeCanvas.width = rect.width * 2;
            compositeCanvas.height = rect.height * 2;

            const ctx = compositeCanvas.getContext("2d", { alpha: false });
            ctx.scale(2, 2);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, rect.width, rect.height);

            canvases.forEach((canvas) => {
              try {
                const canvasRect = canvas.getBoundingClientRect();
                const offsetX = canvasRect.left - rect.left;
                const offsetY = canvasRect.top - rect.top;

                const transform = window.getComputedStyle(canvas).transform;
                let translateX = 0;
                let translateY = 0;

                if (transform && transform !== "none") {
                  const matrix = new DOMMatrix(transform);
                  translateX = matrix.m41;
                  translateY = matrix.m42;
                }

                ctx.drawImage(
                  canvas,
                  offsetX + translateX,
                  offsetY + translateY,
                  canvasRect.width,
                  canvasRect.height
                );
              } catch (e) {
                console.warn("Could not draw canvas:", e);
              }
            });

            let svgsProcessed = 0;
            const totalSvgs = svgs.length;

            const finishProcessing = () => {
              const snapshot = compositeCanvas.toDataURL("image/png", 1.0);
              mapContainer.setAttribute("data-map-snapshot", snapshot);
              processedSnapshots.push(index);

              if (processedSnapshots.length === mapContainers.length) {
                setTimeout(resolve, 200);
              }
            };

            if (totalSvgs === 0) {
              finishProcessing();
              return;
            }

            svgs.forEach((svg) => {
              try {
                const svgRect = svg.getBoundingClientRect();
                const offsetX = svgRect.left - rect.left;
                const offsetY = svgRect.top - rect.top;

                const pane = svg.closest(".leaflet-overlay-pane, .leaflet-pane");
                let translateX = 0;
                let translateY = 0;

                if (pane) {
                  const paneTransform = window.getComputedStyle(pane).transform;
                  if (paneTransform && paneTransform !== "none") {
                    const matrix = new DOMMatrix(paneTransform);
                    translateX = matrix.m41;
                    translateY = matrix.m42;
                  }
                }

                const svgData = new XMLSerializer().serializeToString(svg);
                const svgBlob = new Blob([svgData], {
                  type: "image/svg+xml;charset=utf-8",
                });
                const svgUrl = URL.createObjectURL(svgBlob);

                const svgImg = new Image();
                svgImg.crossOrigin = "anonymous";

                svgImg.onload = () => {
                  try {
                    ctx.drawImage(
                      svgImg,
                      offsetX + translateX,
                      offsetY + translateY,
                      svgRect.width,
                      svgRect.height
                    );
                  } catch (e) {
                    console.warn("Could not draw SVG:", e);
                  }
                  URL.revokeObjectURL(svgUrl);
                  svgsProcessed++;

                  if (svgsProcessed === totalSvgs) {
                    finishProcessing();
                  }
                };

                svgImg.onerror = () => {
                  URL.revokeObjectURL(svgUrl);
                  svgsProcessed++;

                  if (svgsProcessed === totalSvgs) {
                    finishProcessing();
                  }
                };

                svgImg.src = svgUrl;
              } catch (e) {
                console.warn("Error processing SVG:", e);
                svgsProcessed++;

                if (svgsProcessed === totalSvgs) {
                  finishProcessing();
                }
              }
            });
          } catch (e) {
            console.warn("Error processing map container:", e);
            processedSnapshots.push(index);

            if (processedSnapshots.length === mapContainers.length) {
              setTimeout(resolve, 200);
            }
          }
        });

        setTimeout(() => {
          if (processedSnapshots.length < mapContainers.length) {
            console.warn("Map capture timeout, proceeding anyway");
            resolve();
          }
        }, 5000);
      } catch (e) {
        console.warn("Error in captureLeafletMapsToImages:", e);
        resolve();
      }
    });
  }, []);

  const captureSectionFromDOM = useCallback(
    async (section) => {
      const originalWidth = section.style.width;
      const originalMaxWidth = section.style.maxWidth;
      const originalTransform = section.style.transform;
      const originalDisplay = section.style.display;

      section.style.width = `${PDF_CAPTURE_WIDTH}px`;
      section.style.maxWidth = `${PDF_CAPTURE_WIDTH}px`;
      section.style.transform = "none";
      section.style.display = "block";

      try {
        await captureLeafletMapsToImages(section);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvas = await html2canvas(section, {
          scale: 1.5,
          width: PDF_CAPTURE_WIDTH,
          windowWidth: PDF_CAPTURE_WIDTH,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          imageTimeout: 20000,
          removeContainer: false,
          onclone: (clonedDoc, clonedElement) => {
            clonedElement.style.width = `${PDF_CAPTURE_WIDTH}px`;
            clonedElement.style.maxWidth = `${PDF_CAPTURE_WIDTH}px`;
            clonedElement.style.transform = "none";
            clonedElement.style.display = "block";

            const clonedMaps = clonedElement.querySelectorAll(".leaflet-container");
            const originalMaps = section.querySelectorAll(".leaflet-container");

            clonedMaps.forEach((clonedMap, index) => {
              if (originalMaps[index]) {
                const snapshot = originalMaps[index].getAttribute("data-map-snapshot");

                if (snapshot) {
                  clonedMap.innerHTML = "";

                  const img = clonedDoc.createElement("img");
                  img.src = snapshot;
                  img.style.width = "100%";
                  img.style.height = "100%";
                  img.style.objectFit = "cover";
                  img.style.display = "block";

                  clonedMap.appendChild(img);
                  clonedMap.style.background = "white";
                }
              }
            });

            clonedElement
              .querySelectorAll(".legend-dropdown-wrapper")
              .forEach((wrapper) => {
                const button = wrapper.querySelector("button");
                if (button) button.style.display = "none";

                const dropdown = wrapper.querySelector("[class*='absolute']");
                if (dropdown) dropdown.style.display = "none";
              });

            clonedElement.querySelectorAll(".pdf-legend-bar").forEach((legend) => {
              legend.style.display = "flex !important";
              legend.style.visibility = "visible !important";
              legend.style.opacity = "1 !important";
              legend.style.pointerEvents = "none";
            });

            clonedElement.querySelectorAll(".leaflet-control").forEach((control) => {
              control.style.display = "none";
            });

            clonedElement.querySelectorAll("img").forEach((img) => {
              img.style.display = "block";
              img.style.visibility = "visible";
              img.style.opacity = "1";
            });

            clonedElement.querySelectorAll("button, [role='button']").forEach((btn) => {
              if (!btn.closest(".pdf-legend-bar")) {
                btn.style.pointerEvents = "none";
              }
            });
          },
        });

        return canvas;
      } finally {
        section.style.width = originalWidth;
        section.style.maxWidth = originalMaxWidth;
        section.style.transform = originalTransform;
        section.style.display = originalDisplay;
      }
    },
    [captureLeafletMapsToImages]
  );

  const addPDFHeader = useCallback((pdf, pageNumber, totalPages, fieldName) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(...DARK_GREEN.primary);
    pdf.rect(0, 0, pdfWidth, PDF_CONFIG.HEADER_HEIGHT, "F");

    pdf.setTextColor(...DARK_GREEN.text);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(APP_NAME, 12, 10);

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    const truncatedName =
      fieldName && fieldName.length > 35
        ? fieldName.substring(0, 32) + "..."
        : fieldName || "Farm Report";
    pdf.text(truncatedName, 50, 10);

    pdf.setFontSize(6);
    const pageText = `Page ${pageNumber} of ${totalPages}`;
    const pageWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, pdfWidth - pageWidth - 10, 10);
  }, []);

  const addPDFFooter = useCallback((pdf) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.setFillColor(...DARK_GREEN.primary);
    pdf.rect(
      0,
      pdfHeight - PDF_CONFIG.FOOTER_HEIGHT,
      pdfWidth,
      PDF_CONFIG.FOOTER_HEIGHT,
      "F"
    );

    pdf.setTextColor(...DARK_GREEN.text);
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    const year = new Date().getFullYear();
    pdf.text(`© ${year} ${APP_NAME} | ${APP_TAGLINE}`, 10, pdfHeight - 3);

    const contactText = APP_SITE_URL.replace(/^https?:\/\//, "");
    const contactWidth = pdf.getTextWidth(contactText);
    pdf.text(contactText, pdfWidth - contactWidth - 10, pdfHeight - 3);
  }, []);

  const addSectionTitle = useCallback((pdf, title, yPosition) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = PDF_CONFIG.MARGIN_LEFT;

    pdf.setFillColor(...DARK_GREEN.primary);
    pdf.roundedRect(
      margin,
      yPosition,
      pdfWidth - margin * 2,
      PDF_CONFIG.SECTION_TITLE_HEIGHT,
      1,
      1,
      "F"
    );

    pdf.setTextColor(...DARK_GREEN.text);
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, margin + 3, yPosition + 5.5);

    return yPosition + PDF_CONFIG.SECTION_TITLE_HEIGHT + 1;
  }, []);

  const createCoverPage = useCallback(
    async (pdf, fieldName, logoBase64) => {
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(...DARK_GREEN.primary);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      // Add logo if available
      if (logoBase64) {
        try {
          const logoWidth = 30;
          const logoHeight = 30;
          pdf.addImage(
            `data:image/png;base64,${logoBase64}`,
            "PNG",
            pdfWidth / 2 - logoWidth / 2,
            15,
            logoWidth,
            logoHeight
          );
        } catch (e) {
          console.warn("Could not add logo to PDF:", e);
        }
      }

      pdf.setTextColor(...DARK_GREEN.text);
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.text(APP_NAME, pdfWidth / 2, 55, { align: "center" });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...DARK_GREEN.accent);
      pdf.text(APP_TAGLINE, pdfWidth / 2, 63, { align: "center" });

      pdf.setTextColor(...DARK_GREEN.text);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Farm Analysis Report", pdfWidth / 2, 80, { align: "center" });

      pdf.setFontSize(13);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...DARK_GREEN.accent);
      pdf.text(fieldName || "Farm Report", pdfWidth / 2, 90, { align: "center" });

      const farmId =
        selectedFieldDetails?.id ||
        selectedFieldDetails?.farmId ||
        selectedFieldDetails?._id ||
        "N/A";

      const cropName =
        selectedFieldDetails?.cropName || selectedFieldDetails?.crop || "N/A";

      const variety =
        selectedFieldDetails?.variety ||
        selectedFieldDetails?.cropVariety ||
        selectedFieldDetails?.Variety ||
        "N/A";

      const sowingDate =
        selectedFieldDetails?.sowingDate ||
        selectedFieldDetails?.date ||
        selectedFieldDetails?.createdAt;

      const formattedDate = sowingDate
        ? new Date(sowingDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A";

      const area =
        selectedFieldDetails?.areaInHectares ||
        (selectedFieldDetails?.acre ? selectedFieldDetails.acre * 0.404686 : null);

      const areaText = typeof area === "number" ? `${area.toFixed(2)} ha` : "N/A";

      const cardMargin = 22;
      const cardWidth = pdfWidth - cardMargin * 2;
      const cardY = 105;
      const cardPadding = 12;
      const rowHeight = 22;
      const cardHeight = rowHeight * 3 + cardPadding * 2;

      pdf.setFillColor(...DARK_GREEN.secondary);
      pdf.roundedRect(cardMargin, cardY, cardWidth, cardHeight, 4, 4, "F");

      const col1X = cardMargin + cardPadding;
      const col2X = pdfWidth / 2 + 5;
      const labelValueGap = 4;

      const drawField = (label, value, x, y) => {
        pdf.setTextColor(...DARK_GREEN.accent);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(label, x, y);

        pdf.setTextColor(...DARK_GREEN.text);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const displayValue = value && value !== "N/A" ? String(value) : "N/A";
        const maxWidth = col2X - col1X - 3;
        pdf.text(displayValue, x, y + labelValueGap + 3, { maxWidth });
      };

      const row1Y = cardY + cardPadding + 2;
      const row2Y = row1Y + rowHeight;
      const row3Y = row2Y + rowHeight;

      pdf.setDrawColor(...DARK_GREEN.accent);
      pdf.setLineWidth(0.2);
      pdf.line(cardMargin + 6, row1Y + rowHeight - 4, cardMargin + cardWidth - 6, row1Y + rowHeight - 4);
      pdf.line(cardMargin + 6, row2Y + rowHeight - 4, cardMargin + cardWidth - 6, row2Y + rowHeight - 4);
      pdf.line(pdfWidth / 2, cardY + 6, pdfWidth / 2, cardY + cardHeight - 6);

      drawField("Farm ID", farmId, col1X, row1Y);
      drawField("Crop", cropName, col2X, row1Y);
      drawField("Variety", variety, col1X, row2Y);
      drawField("Sowing Date", formattedDate, col2X, row2Y);
      drawField("Total Area", areaText, col1X, row3Y);
      drawField("Status", "Active", col2X, row3Y);

      const dateCardY = cardY + cardHeight + 14;
      const dateCardHeight = 28;

      pdf.setFillColor(...DARK_GREEN.secondary);
      pdf.roundedRect(cardMargin, dateCardY, cardWidth, dateCardHeight, 4, 4, "F");

      const reportDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      pdf.setTextColor(...DARK_GREEN.accent);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("REPORT GENERATED ON", pdfWidth / 2, dateCardY + 8, { align: "center" });

      pdf.setTextColor(...DARK_GREEN.text);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(reportDate, pdfWidth / 2, dateCardY + 20, { align: "center" });

      pdf.setTextColor(...DARK_GREEN.accent);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        APP_SITE_URL.replace(/^https?:\/\//, ""),
        pdfWidth / 2,
        pdfHeight - 28,
        { align: "center" }
      );

      pdf.setFontSize(6);
      pdf.text(
        "Powered by satellite imagery and AI analytics",
        pdfWidth / 2,
        pdfHeight - 20,
        { align: "center" }
      );
      pdf.text(
        `© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.`,
        pdfWidth / 2,
        pdfHeight - 12,
        { align: "center" }
      );
    },
    [selectedFieldDetails]
  );

  const createNewPage = useCallback(
    (pdf, pageNumber, totalPages, fieldName) => {
      pdf.addPage();
      addPDFHeader(pdf, pageNumber, totalPages, fieldName);
      addPDFFooter(pdf);
    },
    [addPDFHeader, addPDFFooter]
  );

  const waitForDataReadiness = useCallback(() => {
    const maxWaitMs = 8000;
    const pollIntervalMs = 200;
    const start = Date.now();

    return new Promise((resolve) => {
      const check = () => {
        const state = store.getState();
        const advisory = state?.smartAdvisory?.advisory;
        const indexData = state?.satellite?.indexDataByType;
        const forecastData = state?.weather?.forecastData;

        const hasAdvisory = !!advisory;
        const hasIndexData =
          indexData &&
          (indexData.NDVI ||
            indexData.NDMI ||
            indexData.NDRE ||
            indexData.TRUE_COLOR);
        const hasForecast =
          !!forecastData?.current ||
          !!forecastData?.forecast ||
          (forecastData &&
            typeof forecastData === "object" &&
            (forecastData.current || forecastData.forecast));

        const ready = hasAdvisory || hasIndexData || hasForecast;

        if (ready || Date.now() - start >= maxWaitMs) {
          resolve();
          return;
        }
        setTimeout(check, pollIntervalMs);
      };
      check();
    });
  }, []);

  const getSectionTitle = useCallback((sectionElement) => {
    if (sectionElement?.dataset?.sectionTitle) {
      return sectionElement.dataset.sectionTitle;
    }

    const heading = sectionElement?.querySelector(
      "h1, h2, h3, h4, h5, [data-section-title]"
    );
    if (heading?.textContent) {
      return heading.textContent.trim();
    }

    return "Report Section";
  }, []);

  const downloadFarmReportPDF = useCallback(
    async (mainReportRef, onBeforeCapture) => {
      const input = mainReportRef.current;
      if (!input) {
        message.error("Report area not found!");
        return;
      }

      if (onBeforeCapture && typeof onBeforeCapture === "function") {
        onBeforeCapture();
      }

      await new Promise((res) => setTimeout(res, 300));

      setIsDownloading(true);
      setIsPreparedForPDF(true);
      setDownloadProgress(2);

      try {
        const state = store.getState();
        const existingForecast = state?.weather?.forecastData;
        if (aoiId && !existingForecast?.current && !existingForecast?.forecast) {
          store.dispatch(fetchForecastData({ geometry_id: aoiId }));
        }

        await new Promise((res) => setTimeout(res, 1500));
        await waitForDataReadiness();

        setDownloadProgress(8);

        const logoBase64 = await getLogoBase64();
        const sections = input.querySelectorAll(".farm-section");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const fieldName =
          selectedFieldDetails?.fieldName ||
          selectedFieldDetails?.farmName ||
          selectedFieldDetails?.name ||
          "Farm Report";

        const contentWidth = pdfWidth - PDF_CONFIG.MARGIN_LEFT - PDF_CONFIG.MARGIN_RIGHT;
        const contentStartY = PDF_CONFIG.HEADER_HEIGHT + PDF_CONFIG.CONTENT_PADDING;
        const contentEndY = pdfHeight - PDF_CONFIG.FOOTER_HEIGHT - PDF_CONFIG.CONTENT_PADDING;
        const maxContentHeight = contentEndY - contentStartY;

        // Page Mapping:
        // Page 2: Satellite Maps + Crop Health
        // Page 3: Crop Advisory + Weather Forecast
        // Page 4: NDVI + Water Index + ET
        // Page 5: Insights + Growth Activity

        const pageMappings = {
          0: 2, // Satellite Imagery
          1: 2, // Crop Health & Yield
          2: 3, // Crop Advisory & Soil
          3: 3, // Weather Forecast
          4: 4, // Vegetation & Water Index
          5: 4, // Evapotranspiration
          6: 5, // Agronomic Insights
          7: 5  // Plant Growth Activity
        };

        const capturedSections = [];
        const totalSections = sections.length;

        setDownloadProgress(12);

        // Capture all sections
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          if (sec.classList.contains("exclude-from-pdf")) continue;

          await new Promise((res) => setTimeout(res, 300));

          const canvas = await captureSectionFromDOM(sec);
          const imgHeight = (canvas.height * contentWidth) / canvas.width;
          const sectionTitle = getSectionTitle(sec);

          capturedSections.push({
            canvas,
            imgHeight,
            title: sectionTitle,
            imgData: canvas.toDataURL("image/png", 0.92),
            pageNumber: pageMappings[i] || 2,
          });

          const progress = 12 + (i / totalSections) * 35;
          setDownloadProgress(Math.round(progress));
        }

        setDownloadProgress(50);

        // Calculate total pages
        const titleBarHeight = PDF_CONFIG.SECTION_TITLE_HEIGHT + 2;
        const totalPages = 5;

        // Create cover page
        await createCoverPage(pdf, fieldName, logoBase64);

        // Create pages with sections
        for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
          createNewPage(pdf, pageNum, totalPages, fieldName);
          let currentY = contentStartY;

          // Filter sections for this page
          const pageSections = capturedSections.filter(s => s.pageNumber === pageNum);

          for (let i = 0; i < pageSections.length; i++) {
            const section = pageSections[i];
            const { canvas, imgHeight, title, imgData } = section;

            const sectionHeight = imgHeight + titleBarHeight + PDF_CONFIG.SECTION_GAP;

            // Check if section fits on current page
            if (currentY + sectionHeight > contentEndY) {
              // Scale down to fit
              const availableHeight = contentEndY - currentY - PDF_CONFIG.SECTION_GAP;
              const scaledHeight = Math.min(imgHeight, availableHeight);

              currentY = addSectionTitle(pdf, title, currentY);
              currentY += 1;

              if (scaledHeight > 2) {
                pdf.addImage(
                  imgData,
                  "PNG",
                  PDF_CONFIG.MARGIN_LEFT,
                  currentY,
                  contentWidth,
                  scaledHeight,
                  undefined,
                  "FAST"
                );

                currentY += scaledHeight + PDF_CONFIG.SECTION_GAP;
              }
            } else {
              // Section fits normally
              currentY = addSectionTitle(pdf, title, currentY);
              currentY += 1;

              pdf.addImage(
                imgData,
                "PNG",
                PDF_CONFIG.MARGIN_LEFT,
                currentY,
                contentWidth,
                imgHeight,
                undefined,
                "FAST"
              );

              currentY += imgHeight + PDF_CONFIG.SECTION_GAP;
            }
          }
        }

        setDownloadProgress(96);

        // Save PDF
        const safeName = (fieldName)
          .toString()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase();

        const fileName = `farm-report-${safeName}-${new Date().toISOString().split("T")[0]}.pdf`;

        pdf.save(fileName);

        setDownloadProgress(100);
        message.success("Farm report downloaded successfully!");

        setTimeout(() => {
          setDownloadProgress(0);
        }, 1500);
      } catch (error) {
        console.error("Error generating PDF:", error);
        message.error("Failed to generate PDF. Please try again.");
        setDownloadProgress(0);
      } finally {
        setTimeout(() => {
          setIsDownloading(false);
          setIsPreparedForPDF(false);
        }, 800);
      }
    },
    [
      selectedFieldDetails,
      aoiId,
      addPDFHeader,
      addPDFFooter,
      addSectionTitle,
      createCoverPage,
      getLogoBase64,
      captureSectionFromDOM,
      waitForDataReadiness,
      createNewPage,
      getSectionTitle,
    ]
  );

  return {
    isDownloading,
    downloadProgress,
    isPreparedForPDF,
    downloadFarmReportPDF,
  };
};

export default useFarmReportPDF;