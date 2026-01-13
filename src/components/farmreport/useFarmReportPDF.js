// useFarmReportPDF.js
import { useState, useCallback } from "react";
import { message } from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CropGenLogo from "../../assets/image/login/logo.svg";

const SECTION_TITLES = [
  "Satellite Imagery & Crop Health",
  "Weather & Vegetation Indices",
  "Insights & Advisory",
];

// Sections that should always start on a new page
const NEW_PAGE_SECTIONS = [
  "insights",
  "weekly crop advisory",
  "plant growth",
  "weekly advisory",
  "crop advisory",
  "growth stage",
  "plant growth stage",
];

const useFarmReportPDF = (selectedFieldDetails) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPreparedForPDF, setIsPreparedForPDF] = useState(false);

  // PDF Layout Constants
  const PDF_CONFIG = {
    MARGIN_LEFT: 10,
    MARGIN_RIGHT: 10,
    HEADER_HEIGHT: 14,
    FOOTER_HEIGHT: 10,
    SECTION_TITLE_HEIGHT: 10,
    SECTION_GAP: 6,
    CONTENT_PADDING: 2,
  };

  // Check if a section should start on a new page
  const shouldStartNewPage = useCallback((sectionElement, sectionTitle) => {
    // Check by section title
    const titleLower = sectionTitle?.toLowerCase() || "";
    if (NEW_PAGE_SECTIONS.some((keyword) => titleLower.includes(keyword))) {
      return true;
    }

    // Check by data attribute
    if (sectionElement?.dataset?.newPage === "true") {
      return true;
    }

    // Check by class name
    if (sectionElement?.classList?.contains("new-page-section")) {
      return true;
    }

    // Check by section id or other attributes
    const sectionId = sectionElement?.id?.toLowerCase() || "";
    const sectionClass = sectionElement?.className?.toLowerCase() || "";

    const checkPatterns = [
      "insight",
      "advisory",
      "plant-growth",
      "plantgrowth",
      "growth-stage",
      "weekly-advisory",
    ];

    return checkPatterns.some(
      (pattern) => sectionId.includes(pattern) || sectionClass.includes(pattern)
    );
  }, []);

  // Convert SVG to high-quality PNG base64
  const getLogoBase64 = useCallback(() => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const scale = 4;
        const canvas = document.createElement("canvas");
        const targetWidth = 280 * scale;
        const targetHeight = 84 * scale;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.clearRect(0, 0, targetWidth, targetHeight);

        const aspectRatio = img.width / img.height;
        let drawWidth = targetWidth;
        let drawHeight = targetWidth / aspectRatio;

        if (drawHeight > targetHeight) {
          drawHeight = targetHeight;
          drawWidth = targetHeight * aspectRatio;
        }

        const x = (targetWidth - drawWidth) / 2;
        const y = (targetHeight - drawHeight) / 2;
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        try {
          resolve(canvas.toDataURL("image/png", 1.0));
        } catch (e) {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);
      img.src = CropGenLogo;
    });
  }, []);

  // Capture Leaflet map canvases to static images
  const captureLeafletMapsToImages = useCallback((element) => {
    return new Promise((resolve) => {
      try {
        const mapContainers = element.querySelectorAll(".leaflet-container");

        mapContainers.forEach((mapContainer) => {
          const canvases = mapContainer.querySelectorAll("canvas");
          const svgs = mapContainer.querySelectorAll("svg");

          const rect = mapContainer.getBoundingClientRect();
          const compositeCanvas = document.createElement("canvas");
          compositeCanvas.width = rect.width * 2;
          compositeCanvas.height = rect.height * 2;
          compositeCanvas.style.width = rect.width + "px";
          compositeCanvas.style.height = rect.height + "px";

          const ctx = compositeCanvas.getContext("2d");
          ctx.scale(2, 2);

          canvases.forEach((canvas) => {
            try {
              const canvasRect = canvas.getBoundingClientRect();
              const offsetX = canvasRect.left - rect.left;
              const offsetY = canvasRect.top - rect.top;

              const transform = window.getComputedStyle(canvas).transform;
              let translateX = 0,
                translateY = 0;

              if (transform && transform !== "none") {
                const matrix = new DOMMatrix(transform);
                translateX = matrix.m41;
                translateY = matrix.m42;
              }

              ctx.drawImage(
                canvas,
                offsetX + translateX,
                offsetY + translateY,
                canvas.width / (window.devicePixelRatio || 1),
                canvas.height / (window.devicePixelRatio || 1)
              );
            } catch (e) {
              console.warn("Could not draw canvas:", e);
            }
          });

          svgs.forEach((svg) => {
            try {
              const svgRect = svg.getBoundingClientRect();
              const offsetX = svgRect.left - rect.left;
              const offsetY = svgRect.top - rect.top;

              const pane = svg.closest(".leaflet-overlay-pane, .leaflet-pane");
              let translateX = 0,
                translateY = 0;

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
              svgImg.onload = () => {
                ctx.drawImage(
                  svgImg,
                  offsetX + translateX,
                  offsetY + translateY,
                  svgRect.width,
                  svgRect.height
                );
                URL.revokeObjectURL(svgUrl);
              };
              svgImg.src = svgUrl;
            } catch (e) {
              console.warn("Could not draw SVG:", e);
            }
          });

          mapContainer.setAttribute(
            "data-map-snapshot",
            compositeCanvas.toDataURL("image/png", 1.0)
          );
        });

        setTimeout(resolve, 500);
      } catch (e) {
        console.warn("Error capturing Leaflet maps:", e);
        resolve();
      }
    });
  }, []);

  // Helper function to capture a section directly from the DOM
  const captureSectionFromDOM = useCallback(
    async (section, options = {}) => {
      const { scale = 2, backgroundColor = "#2d4339" } = options;

      const originalStyles = {
        position: section.style.position,
        width: section.style.width,
        transform: section.style.transform,
        overflow: section.style.overflow,
      };

      const mapTransforms = new Map();
      const mapContainers = section.querySelectorAll(".leaflet-container");

      mapContainers.forEach((map, index) => {
        const panes = map.querySelectorAll(".leaflet-pane");
        const paneData = [];

        panes.forEach((pane) => {
          paneData.push({
            element: pane,
            transform: pane.style.transform,
            computedTransform: window.getComputedStyle(pane).transform,
          });
        });

        mapTransforms.set(index, {
          map,
          panes: paneData,
          width: map.style.width,
          height: map.style.height,
        });
      });

      try {
        await captureLeafletMapsToImages(section);

        const canvas = await html2canvas(section, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: backgroundColor,
          imageTimeout: 15000,
          removeContainer: false,
          onclone: (clonedDoc, clonedElement) => {
            clonedElement
              .querySelectorAll("path.leaflet-interactive")
              .forEach((path) => {
                path.style.pointerEvents = "none";
              });

            clonedElement.querySelectorAll("img").forEach((img) => {
              img.style.display = "block";
              img.style.visibility = "visible";
              img.style.opacity = "1";
            });

            clonedElement
              .querySelectorAll(".legend-dropdown-wrapper button")
              .forEach((el) => {
                el.style.display = "none";
              });

            clonedElement
              .querySelectorAll(".color-bar-legend, .pdf-legend-bar")
              .forEach((legend) => {
                legend.style.display = "block";
                legend.style.visibility = "visible";
              });

            clonedElement.querySelectorAll(".leaflet-pane").forEach((pane) => {
              const computedTransform = window.getComputedStyle(pane).transform;
              if (computedTransform && computedTransform !== "none") {
                pane.style.transform = computedTransform;
              }
            });

            clonedElement
              .querySelectorAll(".leaflet-image-layer")
              .forEach((img) => {
                const computedStyle = window.getComputedStyle(img);
                img.style.transform = computedStyle.transform;
                img.style.transformOrigin = computedStyle.transformOrigin;
              });
          },
        });

        return canvas;
      } finally {
        Object.assign(section.style, originalStyles);

        mapTransforms.forEach((data) => {
          data.panes.forEach((paneData) => {
            paneData.element.style.transform = paneData.transform;
          });
        });
      }
    },
    [captureLeafletMapsToImages]
  );

  const addPDFHeader = useCallback((pdf, pageNumber, totalPages, fieldName) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(52, 78, 65);
    pdf.rect(0, 0, pdfWidth, 14, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("CropGen", 12, 9);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(fieldName || "Field Report", 50, 9);

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    pdf.setFontSize(7);
    const dateWidth = pdf.getTextWidth(currentDate);
    pdf.text(currentDate, pdfWidth - dateWidth - 25, 9);

    pdf.setFontSize(7);
    const pageText = `${pageNumber}/${totalPages}`;
    const pageWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, pdfWidth - pageWidth - 8, 9);
  }, []);

  const addPDFFooter = useCallback((pdf) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.setFillColor(52, 78, 65);
    pdf.rect(0, pdfHeight - 10, pdfWidth, 10, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");

    pdf.text("© 2025 CropGen | Precision Agriculture", 10, pdfHeight - 4);

    const contactText = "www.cropgenapp.com";
    const contactWidth = pdf.getTextWidth(contactText);
    pdf.text(contactText, pdfWidth - contactWidth - 10, pdfHeight - 4);
  }, []);

  const addSectionTitle = useCallback((pdf, title, yPosition) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(90, 124, 107);
    pdf.roundedRect(10, yPosition, pdfWidth - 20, 8, 1, 1, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 14, yPosition + 5.5);

    return yPosition + 10;
  }, []);

  const formatIrrigationType = (type) => {
    if (!type) return "N/A";
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const createCoverPage = useCallback(
    async (pdf, fieldName, logoBase64) => {
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(52, 78, 65);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      const logoY = 20;
      if (logoBase64) {
        try {
          const logoWidth = 60;
          const logoHeight = 18;
          pdf.addImage(
            logoBase64,
            "PNG",
            pdfWidth / 2 - logoWidth / 2,
            logoY,
            logoWidth,
            logoHeight
          );
        } catch (e) {
          console.warn("Could not add logo to PDF:", e);
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(28);
          pdf.setFont("helvetica", "bold");
          pdf.text("CropGen", pdfWidth / 2, logoY + 12, { align: "center" });
        }
      } else {
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(28);
        pdf.setFont("helvetica", "bold");
        pdf.text("CropGen", pdfWidth / 2, logoY + 12, { align: "center" });
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("CropGen", pdfWidth / 2, 50, { align: "center" });

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(163, 177, 138);
      pdf.text("Precision Agriculture Solutions", pdfWidth / 2, 58, {
        align: "center",
      });

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Farm Analysis Report", pdfWidth / 2, 75, { align: "center" });

      pdf.setFontSize(13);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(163, 177, 138);
      pdf.text(fieldName || "Farm Report", pdfWidth / 2, 85, {
        align: "center",
      });

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

      const irrigationType = formatIrrigationType(
        selectedFieldDetails?.typeOfIrrigation ||
          selectedFieldDetails?.irrigationType ||
          selectedFieldDetails?.irrigation
      );

      const farmingType =
        selectedFieldDetails?.typeOfFarming ||
        selectedFieldDetails?.farmingType ||
        selectedFieldDetails?.farming ||
        "N/A";

      const area =
        selectedFieldDetails?.areaInHectares ||
        (selectedFieldDetails?.acre
          ? selectedFieldDetails.acre * 0.404686
          : null);
      const areaText =
        typeof area === "number" ? `${area.toFixed(2)} ha` : "N/A";

      const cardMargin = 20;
      const cardWidth = pdfWidth - cardMargin * 2;
      const cardY = 95;
      const cardPadding = 12;
      const rowHeight = 22;
      const cardHeight = rowHeight * 4 + cardPadding * 2;

      pdf.setFillColor(44, 67, 57);
      pdf.roundedRect(cardMargin, cardY, cardWidth, cardHeight, 4, 4, "F");

      const col1X = cardMargin + cardPadding;
      const col2X = pdfWidth / 2 + 5;
      const labelValueGap = 5;

      const drawField = (label, value, x, y) => {
        pdf.setTextColor(163, 177, 138);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(label, x, y);

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const displayValue = value && value !== "N/A" ? String(value) : "N/A";
        pdf.text(displayValue, x, y + labelValueGap + 4);
      };

      const row1Y = cardY + cardPadding + 5;
      const row2Y = row1Y + rowHeight;
      const row3Y = row2Y + rowHeight;
      const row4Y = row3Y + rowHeight;

      pdf.setDrawColor(90, 124, 107);
      pdf.setLineWidth(0.3);
      pdf.line(
        cardMargin + 8,
        row1Y + rowHeight - 5,
        cardMargin + cardWidth - 8,
        row1Y + rowHeight - 5
      );
      pdf.line(
        cardMargin + 8,
        row2Y + rowHeight - 5,
        cardMargin + cardWidth - 8,
        row2Y + rowHeight - 5
      );
      pdf.line(
        cardMargin + 8,
        row3Y + rowHeight - 5,
        cardMargin + cardWidth - 8,
        row3Y + rowHeight - 5
      );

      pdf.line(pdfWidth / 2, cardY + 8, pdfWidth / 2, cardY + cardHeight - 8);

      drawField("FARM ID", farmId, col1X, row1Y);
      drawField("CROP", cropName, col2X, row1Y);

      drawField("VARIETY", variety, col1X, row2Y);
      drawField("SOWING DATE", formattedDate, col2X, row2Y);

      drawField("IRRIGATION TYPE", irrigationType, col1X, row3Y);
      drawField("FARMING TYPE", farmingType, col2X, row3Y);

      drawField("TOTAL AREA", areaText, col1X, row4Y);

      if (selectedFieldDetails?.acre) {
        drawField(
          "AREA (ACRES)",
          `${selectedFieldDetails.acre.toFixed(2)} acres`,
          col2X,
          row4Y
        );
      }

      const dateCardY = cardY + cardHeight + 12;
      const dateCardHeight = 28;

      pdf.setFillColor(44, 67, 57);
      pdf.roundedRect(
        cardMargin,
        dateCardY,
        cardWidth,
        dateCardHeight,
        4,
        4,
        "F"
      );

      const reportDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      pdf.setTextColor(163, 177, 138);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("REPORT GENERATED ON", pdfWidth / 2, dateCardY + 10, {
        align: "center",
      });

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(reportDate, pdfWidth / 2, dateCardY + 20, { align: "center" });

      pdf.setTextColor(163, 177, 138);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("www.cropgenapp.com", pdfWidth / 2, pdfHeight - 28, {
        align: "center",
      });

      pdf.setTextColor(120, 140, 130);
      pdf.setFontSize(7);
      pdf.text(
        "Powered by satellite imagery and AI analytics",
        pdfWidth / 2,
        pdfHeight - 20,
        { align: "center" }
      );

      pdf.text(
        "© 2025 CropGen. All rights reserved.",
        pdfWidth / 2,
        pdfHeight - 14,
        { align: "center" }
      );
    },
    [selectedFieldDetails]
  );

  // Calculate how many pages a section will need
  const calculateSectionPages = useCallback(
    (imgHeight, currentY, maxContentHeight, contentStartY) => {
      const availableOnCurrentPage =
        maxContentHeight - (currentY - contentStartY);

      if (imgHeight <= availableOnCurrentPage) {
        return { pagesNeeded: 0, newY: currentY + imgHeight };
      }

      let remaining = imgHeight - availableOnCurrentPage;
      let pages = 1;

      while (remaining > maxContentHeight) {
        remaining -= maxContentHeight;
        pages++;
      }

      return { pagesNeeded: pages, newY: contentStartY + remaining };
    },
    []
  );

  // Create a new page with header and footer
  const createNewPage = useCallback(
    (pdf, pageNumber, totalPages, fieldName) => {
      pdf.addPage();
      addPDFHeader(pdf, pageNumber, totalPages, fieldName);
      addPDFFooter(pdf);
    },
    [addPDFHeader, addPDFFooter]
  );

  // Get section title from element
  const getSectionTitle = useCallback((sectionElement, index) => {
    // Try to get title from data attribute
    if (sectionElement?.dataset?.sectionTitle) {
      return sectionElement.dataset.sectionTitle;
    }

    // Try to get title from heading inside section
    const heading = sectionElement?.querySelector("h1, h2, h3, h4, .section-title");
    if (heading?.textContent) {
      return heading.textContent.trim();
    }

    // Fallback to predefined titles or generic title
    return SECTION_TITLES[index] || `Section ${index + 1}`;
  }, []);

  // Main continuous flow PDF generator with new page support
  const downloadFarmReportPDF = useCallback(
    async (mainReportRef) => {
      const input = mainReportRef.current;
      if (!input) {
        message.error("Report area not found!");
        return;
      }

      setIsDownloading(true);
      setIsPreparedForPDF(true);
      setDownloadProgress(0);

      await new Promise((res) => setTimeout(res, 500));

      try {
        const logoBase64 = await getLogoBase64();

        const sections = input.querySelectorAll(".farm-section");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const fieldName =
          selectedFieldDetails?.fieldName ||
          selectedFieldDetails?.farmName ||
          "Farm Report";

        // Layout calculations
        const contentWidth =
          pdfWidth - PDF_CONFIG.MARGIN_LEFT - PDF_CONFIG.MARGIN_RIGHT;
        const contentStartY =
          PDF_CONFIG.HEADER_HEIGHT + PDF_CONFIG.CONTENT_PADDING;
        const contentEndY =
          pdfHeight - PDF_CONFIG.FOOTER_HEIGHT - PDF_CONFIG.CONTENT_PADDING;
        const maxContentHeight = contentEndY - contentStartY;

        // First pass: Capture all sections and calculate total pages
        const capturedSections = [];
        const totalSections = sections.length;

        setDownloadProgress(5);

        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];

          if (sec.classList.contains("exclude-from-pdf")) continue;

          await new Promise((res) => setTimeout(res, 200));

          const canvas = await captureSectionFromDOM(sec, {
            scale: 2,
            backgroundColor: "#2d4339",
          });

          const imgHeight = (canvas.height * contentWidth) / canvas.width;
          const sectionTitle = getSectionTitle(sec, i);
          const forceNewPage = shouldStartNewPage(sec, sectionTitle);

          capturedSections.push({
            canvas,
            imgHeight,
            title: sectionTitle,
            imgData: canvas.toDataURL("image/png", 1.0),
            forceNewPage,
            element: sec,
          });

          setDownloadProgress(5 + (i / totalSections) * 40);
        }

        // Calculate total pages needed (considering forced new pages)
        let tempY = contentStartY;
        let pagesNeeded = 1;
        let isFirstSection = true;

        capturedSections.forEach((section, index) => {
          const titleHeight = PDF_CONFIG.SECTION_TITLE_HEIGHT;

          // Force new page for specific sections (except first section)
          if (section.forceNewPage && !isFirstSection) {
            pagesNeeded++;
            tempY = contentStartY;
          }

          // Check if title + minimum content fits on current page
          if (tempY + titleHeight + 20 > contentEndY) {
            pagesNeeded++;
            tempY = contentStartY;
          }

          const { pagesNeeded: additionalPages, newY } = calculateSectionPages(
            section.imgHeight,
            tempY + titleHeight,
            maxContentHeight,
            contentStartY
          );

          pagesNeeded += additionalPages;
          tempY = newY + PDF_CONFIG.SECTION_GAP;

          if (tempY > contentEndY) {
            tempY = contentStartY;
          }

          isFirstSection = false;
        });

        const totalPages = pagesNeeded + 1; // +1 for cover page

        setDownloadProgress(50);

        // Create Cover Page
        await createCoverPage(pdf, fieldName, logoBase64);

        // Create first content page
        let currentPage = 2;
        createNewPage(pdf, currentPage, totalPages, fieldName);
        let currentY = contentStartY;
        let isFirstSectionOnPage = true;

        // Second pass: Generate the PDF with continuous flow + forced page breaks
        for (let i = 0; i < capturedSections.length; i++) {
          const section = capturedSections[i];
          const { canvas, imgHeight, title, imgData, forceNewPage } = section;

          const titleHeight = PDF_CONFIG.SECTION_TITLE_HEIGHT;
          const minContentHeight = 20;

          // Force new page for specific sections (Insights, Weekly Advisory, Plant Growth)
          // But not for the very first section
          if (forceNewPage && i > 0 && currentY > contentStartY) {
            currentPage++;
            createNewPage(pdf, currentPage, totalPages, fieldName);
            currentY = contentStartY;
            isFirstSectionOnPage = true;
          }

          // Check if section title + minimum content fits on current page
          if (currentY + titleHeight + minContentHeight > contentEndY) {
            currentPage++;
            createNewPage(pdf, currentPage, totalPages, fieldName);
            currentY = contentStartY;
            isFirstSectionOnPage = true;
          }

          // Add section title
          currentY = addSectionTitle(pdf, title, currentY);
          currentY += 2; // Small gap after title

          const remainingHeight = contentEndY - currentY;

          if (imgHeight <= remainingHeight) {
            // Image fits completely in remaining space
            pdf.addImage(
              imgData,
              "PNG",
              PDF_CONFIG.MARGIN_LEFT,
              currentY,
              contentWidth,
              imgHeight
            );
            currentY += imgHeight + PDF_CONFIG.SECTION_GAP;
            isFirstSectionOnPage = false;
          } else {
            // Need to split the image across pages
            let remainingImgHeight = imgHeight;
            let sourceY = 0;
            let isFirstPart = true;

            while (remainingImgHeight > 0) {
              const availableHeight = isFirstPart
                ? remainingHeight
                : maxContentHeight;
              const partHeight = Math.min(remainingImgHeight, availableHeight);
              const sourceHeight = (partHeight / imgHeight) * canvas.height;

              // Create a part canvas
              const partCanvas = document.createElement("canvas");
              partCanvas.width = canvas.width;
              partCanvas.height = Math.ceil(sourceHeight);
              const partCtx = partCanvas.getContext("2d");

              partCtx.drawImage(
                canvas,
                0,
                Math.floor(sourceY),
                canvas.width,
                Math.ceil(sourceHeight),
                0,
                0,
                canvas.width,
                Math.ceil(sourceHeight)
              );

              const partImgData = partCanvas.toDataURL("image/png", 1.0);
              const drawY = isFirstPart ? currentY : contentStartY;

              pdf.addImage(
                partImgData,
                "PNG",
                PDF_CONFIG.MARGIN_LEFT,
                drawY,
                contentWidth,
                partHeight
              );

              sourceY += sourceHeight;
              remainingImgHeight -= partHeight;

              if (remainingImgHeight > 0) {
                // Need another page for continuation
                currentPage++;
                createNewPage(pdf, currentPage, totalPages, fieldName);
                currentY = contentStartY;
              } else {
                // Finished this section
                currentY = drawY + partHeight + PDF_CONFIG.SECTION_GAP;
              }

              isFirstPart = false;
            }
            isFirstSectionOnPage = false;
          }

          // Check if we need a new page for next section
          // But respect forced new page sections
          const nextSection = capturedSections[i + 1];
          if (nextSection) {
            // If next section forces new page, don't create one here
            if (!nextSection.forceNewPage && currentY > contentEndY - 10) {
              currentPage++;
              createNewPage(pdf, currentPage, totalPages, fieldName);
              currentY = contentStartY;
              isFirstSectionOnPage = true;
            }
          }

          setDownloadProgress(50 + ((i + 1) / capturedSections.length) * 45);
        }

        setDownloadProgress(98);

        const fileName = `cropgen-report-${
          selectedFieldDetails?.fieldName ||
          selectedFieldDetails?.farmName ||
          "report"
        }-${new Date().toISOString().split("T")[0]}.pdf`;

        pdf.save(fileName);

        setDownloadProgress(100);
        message.success("Farm report downloaded successfully!");

        setTimeout(() => {
          setDownloadProgress(0);
        }, 1000);
      } catch (error) {
        console.error("Error generating PDF:", error);
        message.error("Failed to generate PDF. Please try again.");
      } finally {
        setTimeout(() => {
          setIsDownloading(false);
          setIsPreparedForPDF(false);
        }, 1000);
      }
    },
    [
      selectedFieldDetails,
      addPDFHeader,
      addPDFFooter,
      addSectionTitle,
      createCoverPage,
      getLogoBase64,
      captureSectionFromDOM,
      calculateSectionPages,
      createNewPage,
      shouldStartNewPage,
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