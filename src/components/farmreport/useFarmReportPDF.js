// useFarmReportPDF.js
import { useState, useCallback } from "react";
import { message } from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Import the logo - adjust the path based on your project structure
import CropGenLogo from "../../assets/image/login/logo.svg";

const SECTION_TITLES = [
    "Satellite Imagery & Crop Health",
    "Weather & Vegetation Indices",
    "Insights & Advisory",
];

const useFarmReportPDF = (selectedFieldDetails) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isPreparedForPDF, setIsPreparedForPDF] = useState(false);

    // Convert SVG to high-quality PNG base64 for PDF embedding
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
                    console.warn("Could not convert logo to base64:", e);
                    resolve(null);
                }
            };

            img.onerror = () => {
                console.warn("Could not load logo image");
                resolve(null);
            };

            img.src = CropGenLogo;
        });
    }, []);

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

    // Helper function to format irrigation type
    const formatIrrigationType = (type) => {
        if (!type) return "N/A";
        return type
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Clean and Professional Cover Page Generator with all field details
    const createCoverPage = useCallback(
        async (pdf, fieldName, logoBase64) => {
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Clean dark green background
            pdf.setFillColor(52, 78, 65);
            pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

            // Logo section
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

            // CropGen heading below logo
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont("helvetica", "bold");
            pdf.text("CropGen", pdfWidth / 2, 50, { align: "center" });

            // Tagline
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(163, 177, 138);
            pdf.text("Precision Agriculture Solutions", pdfWidth / 2, 58, {
                align: "center",
            });

            // Report Title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(20);
            pdf.setFont("helvetica", "bold");
            pdf.text("Farm Analysis Report", pdfWidth / 2, 75, { align: "center" });

            // Field Name
            pdf.setFontSize(13);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(163, 177, 138);
            pdf.text(fieldName || "Farm Report", pdfWidth / 2, 85, {
                align: "center",
            });

            // Extract field details with correct field names
            const farmId = selectedFieldDetails?.id || 
                          selectedFieldDetails?.farmId || 
                          selectedFieldDetails?._id || 
                          "N/A";
            
            const cropName = selectedFieldDetails?.cropName || 
                            selectedFieldDetails?.crop || 
                            "N/A";
            
            const variety = selectedFieldDetails?.variety || 
                           selectedFieldDetails?.cropVariety || 
                           selectedFieldDetails?.Variety ||
                           "N/A";
            
            const sowingDate = selectedFieldDetails?.sowingDate || 
                              selectedFieldDetails?.date || 
                              selectedFieldDetails?.createdAt;
            const formattedDate = sowingDate
                ? new Date(sowingDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : "N/A";
            
            // Fixed: Using correct field names
            const irrigationType = formatIrrigationType(
                selectedFieldDetails?.typeOfIrrigation || 
                selectedFieldDetails?.irrigationType || 
                selectedFieldDetails?.irrigation
            );
            
            const farmingType = selectedFieldDetails?.typeOfFarming || 
                               selectedFieldDetails?.farmingType || 
                               selectedFieldDetails?.farming ||
                               "N/A";

            const area = selectedFieldDetails?.areaInHectares ||
                (selectedFieldDetails?.acre ? selectedFieldDetails.acre * 0.404686 : null);
            const areaText = typeof area === "number" ? `${area.toFixed(2)} ha` : "N/A";

            // Field Details Card
            const cardMargin = 20;
            const cardWidth = pdfWidth - cardMargin * 2;
            const cardY = 95;
            const cardPadding = 12;
            const rowHeight = 22;
            const cardHeight = rowHeight * 4 + cardPadding * 2;

            // Main card background
            pdf.setFillColor(44, 67, 57);
            pdf.roundedRect(cardMargin, cardY, cardWidth, cardHeight, 4, 4, "F");

            // Calculate column positions
            const col1X = cardMargin + cardPadding;
            const col2X = pdfWidth / 2 + 5;
            const labelValueGap = 5;

            // Helper function to draw label and value
            const drawField = (label, value, x, y) => {
                // Label
                pdf.setTextColor(163, 177, 138);
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold");
                pdf.text(label, x, y);

                // Value
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(11);
                pdf.setFont("helvetica", "normal");
                const displayValue = value && value !== "N/A" ? String(value) : "N/A";
                pdf.text(displayValue, x, y + labelValueGap + 4);
            };

            // Row positions
            const row1Y = cardY + cardPadding + 5;
            const row2Y = row1Y + rowHeight;
            const row3Y = row2Y + rowHeight;
            const row4Y = row3Y + rowHeight;

            // Draw horizontal dividers
            pdf.setDrawColor(90, 124, 107);
            pdf.setLineWidth(0.3);
            pdf.line(cardMargin + 8, row1Y + rowHeight - 5, cardMargin + cardWidth - 8, row1Y + rowHeight - 5);
            pdf.line(cardMargin + 8, row2Y + rowHeight - 5, cardMargin + cardWidth - 8, row2Y + rowHeight - 5);
            pdf.line(cardMargin + 8, row3Y + rowHeight - 5, cardMargin + cardWidth - 8, row3Y + rowHeight - 5);

            // Draw vertical divider
            pdf.line(pdfWidth / 2, cardY + 8, pdfWidth / 2, cardY + cardHeight - 8);

            // Row 1: Farm ID | Crop
            drawField("FARM ID", farmId, col1X, row1Y);
            drawField("CROP", cropName, col2X, row1Y);

            // Row 2: Variety | Sowing Date
            drawField("VARIETY", variety, col1X, row2Y);
            drawField("SOWING DATE", formattedDate, col2X, row2Y);

            // Row 3: Irrigation Type | Farming Type
            drawField("IRRIGATION TYPE", irrigationType, col1X, row3Y);
            drawField("FARMING TYPE", farmingType, col2X, row3Y);

            // Row 4: Area | (empty or additional info)
            drawField("TOTAL AREA", areaText, col1X, row4Y);
            
            // Add acres if available
            if (selectedFieldDetails?.acre) {
                drawField("AREA (ACRES)", `${selectedFieldDetails.acre.toFixed(2)} acres`, col2X, row4Y);
            }

            // Report Generation Date Card
            const dateCardY = cardY + cardHeight + 12;
            const dateCardHeight = 28;

            pdf.setFillColor(44, 67, 57);
            pdf.roundedRect(cardMargin, dateCardY, cardWidth, dateCardHeight, 4, 4, "F");

            const reportDate = new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            // Centered date section
            pdf.setTextColor(163, 177, 138);
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "bold");
            pdf.text("REPORT GENERATED ON", pdfWidth / 2, dateCardY + 10, { align: "center" });

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.text(reportDate, pdfWidth / 2, dateCardY + 20, { align: "center" });

            // Footer content
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

    const imageToBase64 = useCallback((img) => {
        return new Promise((resolve) => {
            try {
                if (img.src && img.src.startsWith("data:image")) {
                    resolve(img.src);
                    return;
                }

                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth || img.width || 500;
                canvas.height = img.naturalHeight || img.height || 500;

                const ctx = canvas.getContext("2d");
                const image = new Image();
                image.crossOrigin = "anonymous";

                image.onload = () => {
                    ctx.drawImage(image, 0, 0);
                    try {
                        resolve(canvas.toDataURL("image/png"));
                    } catch {
                        resolve(img.src);
                    }
                };

                image.onerror = () => resolve(img.src);
                image.src = img.src;
            } catch {
                resolve(img.src);
            }
        });
    }, []);

    const processAllImages = useCallback(
        async (element) => {
            const images = element.querySelectorAll("img");
            const promises = [];

            images.forEach((img) => {
                const promise = imageToBase64(img).then((base64) => {
                    img.src = base64;
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.style.display = "block";
                    img.style.objectFit = "contain";
                    img.removeAttribute("srcset");
                    img.removeAttribute("loading");
                });
                promises.push(promise);
            });

            await Promise.all(promises);
        },
        [imageToBase64]
    );

    const convertEChartsToImages = useCallback((element) => {
        return new Promise((resolve) => {
            try {
                const echartsContainers = element.querySelectorAll(
                    '[_echarts_instance_], [class*="echarts-for-react"]'
                );

                echartsContainers.forEach((container) => {
                    const canvas = container.querySelector("canvas");
                    if (canvas) {
                        try {
                            const dataURL = canvas.toDataURL("image/png", 1.0);

                            const img = document.createElement("img");
                            img.src = dataURL;
                            img.style.width = canvas.style.width || canvas.width + "px";
                            img.style.height = canvas.style.height || canvas.height + "px";
                            img.style.display = "block";
                            img.style.visibility = "visible";
                            img.style.opacity = "1";

                            img.setAttribute("data-original-width", canvas.width);
                            img.setAttribute("data-original-height", canvas.height);

                            img.classList.add("echarts-converted-image");

                            canvas.style.display = "none";
                            canvas.parentNode.insertBefore(img, canvas.nextSibling);
                        } catch (e) {
                            console.warn("Could not convert ECharts canvas:", e);
                        }
                    }
                });

                resolve();
            } catch (e) {
                console.warn("Error in convertEChartsToImages:", e);
                resolve();
            }
        });
    }, []);

    const restoreEChartsCanvases = useCallback((element) => {
        try {
            const convertedImages = element.querySelectorAll(
                ".echarts-converted-image"
            );
            convertedImages.forEach((img) => {
                img.remove();
            });

            const echartsContainers = element.querySelectorAll(
                '[_echarts_instance_], [class*="echarts-for-react"]'
            );
            echartsContainers.forEach((container) => {
                const canvas = container.querySelector("canvas");
                if (canvas) {
                    canvas.style.display = "block";
                }
            });
        } catch (e) {
            console.warn("Error restoring ECharts canvases:", e);
        }
    }, []);

    const processChartsAndGraphs = useCallback((element) => {
        element.querySelectorAll("path.leaflet-interactive").forEach((path) => {
            path.style.display = "none";
        });

        element.querySelectorAll(".pdf-legend-bar").forEach((legend) => {
            legend.style.display = "block";
            legend.style.visibility = "visible";
            legend.style.opacity = "1";
        });

        element.querySelectorAll(".color-bar-legend").forEach((legend) => {
            legend.style.display = "block";
            legend.style.visibility = "visible";
            legend.style.marginTop = "8px";
        });

        element.querySelectorAll(".echarts-converted-image").forEach((img) => {
            img.style.display = "block";
            img.style.visibility = "visible";
            img.style.opacity = "1";
        });

        element
            .querySelectorAll('[_echarts_instance_], [class*="echarts-for-react"]')
            .forEach((container) => {
                const convertedImg = container.querySelector(
                    ".echarts-converted-image"
                );
                if (convertedImg) {
                    const canvas = container.querySelector("canvas");
                    if (canvas) {
                        canvas.style.display = "none";
                    }
                }
            });

        element.querySelectorAll("svg").forEach((svg) => {
            const bbox = svg.getBoundingClientRect();
            const width = bbox.width || 800;
            const height = bbox.height || 400;

            svg.setAttribute("width", width);
            svg.setAttribute("height", height);
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svg.style.width = width + "px";
            svg.style.height = height + "px";
            svg.style.display = "block";
            svg.style.visibility = "visible";
            svg.style.overflow = "visible";

            if (!svg.hasAttribute("viewBox")) {
                svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
            }

            svg.querySelectorAll("*").forEach((child) => {
                child.style.visibility = "visible";
                child.style.opacity = "1";
            });
        });

        element.querySelectorAll(".recharts-wrapper").forEach((wrapper) => {
            wrapper.style.width = "100%";
            wrapper.style.height = "350px";
            wrapper.style.minHeight = "350px";
            wrapper.style.overflow = "visible";
            wrapper.style.display = "block";
            wrapper.style.visibility = "visible";

            const svg = wrapper.querySelector("svg.recharts-surface");
            if (svg) {
                const rect = svg.getBoundingClientRect();
                svg.setAttribute("width", rect.width || 800);
                svg.setAttribute("height", rect.height || 350);
                svg.style.width = (rect.width || 800) + "px";
                svg.style.height = (rect.height || 350) + "px";
            }
        });
    }, []);

    const waitForResources = useCallback((element) => {
        return new Promise((resolve) => {
            const images = element.querySelectorAll("img");

            if (images.length === 0) {
                setTimeout(resolve, 500);
                return;
            }

            let loadedCount = 0;
            const totalCount = images.length;

            const checkComplete = () => {
                loadedCount++;
                if (loadedCount >= totalCount) {
                    setTimeout(resolve, 500);
                }
            };

            images.forEach((img) => {
                if (img.complete && img.naturalHeight !== 0) {
                    checkComplete();
                } else {
                    img.onload = checkComplete;
                    img.onerror = checkComplete;
                }
            });
        });
    }, []);

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

            await new Promise((res) => setTimeout(res, 1000));

            await convertEChartsToImages(input);

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

                const totalSections = sections.length;
                const totalPages = totalSections + 1;
                let pageNumber = 1;

                // Create Professional Cover Page
                await createCoverPage(pdf, fieldName, logoBase64);

                pageNumber++;

                for (let i = 0; i < sections.length; i++) {
                    const sec = sections[i];
                    setDownloadProgress((i / totalSections) * 85 + 5);

                    if (sec.classList.contains("exclude-from-pdf")) continue;

                    const clone = sec.cloneNode(true);
                    clone.style.position = "absolute";
                    clone.style.top = "0";
                    clone.style.left = "-99999px";
                    clone.style.width = "1200px";
                    clone.style.minWidth = "1200px";
                    clone.style.background = "#2d4339";
                    clone.style.padding = "20px";
                    clone.style.boxSizing = "border-box";

                    clone.querySelectorAll("path.leaflet-interactive").forEach((path) => {
                        path.remove();
                    });

                    clone.querySelectorAll(".legend-dropdown-wrapper").forEach((el) => {
                        el.remove();
                    });

                    clone
                        .querySelectorAll(".color-bar-legend, .pdf-legend-bar")
                        .forEach((legend) => {
                            legend.style.display = "block";
                            legend.style.visibility = "visible";
                            legend.style.opacity = "1";
                        });

                    clone.querySelectorAll(".echarts-converted-image").forEach((img) => {
                        img.style.display = "block";
                        img.style.visibility = "visible";
                        img.style.opacity = "1";
                    });

                    clone.querySelectorAll("canvas").forEach((canvas) => {
                        const parent = canvas.parentElement;
                        const hasConvertedImage = parent?.querySelector(
                            ".echarts-converted-image"
                        );
                        if (hasConvertedImage) {
                            canvas.style.display = "none";
                        }
                    });

                    document.body.appendChild(clone);
                    await new Promise((res) => setTimeout(res, 300));

                    await processAllImages(clone);
                    processChartsAndGraphs(clone);
                    await waitForResources(clone);
                    await new Promise((res) => setTimeout(res, 1000));

                    const canvas = await html2canvas(clone, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        backgroundColor: "#2d4339",
                        width: 1200,
                        height: clone.scrollHeight,
                        windowWidth: 1200,
                        windowHeight: clone.scrollHeight,
                        imageTimeout: 15000,
                        onclone: (clonedDoc, clonedElement) => {
                            clonedElement
                                .querySelectorAll("path.leaflet-interactive")
                                .forEach((path) => {
                                    path.style.display = "none";
                                    path.style.visibility = "hidden";
                                });

                            clonedElement.querySelectorAll("img").forEach((img) => {
                                img.style.display = "block";
                                img.style.visibility = "visible";
                                img.style.opacity = "1";
                            });

                            clonedElement
                                .querySelectorAll(".echarts-converted-image")
                                .forEach((img) => {
                                    img.style.display = "block";
                                    img.style.visibility = "visible";
                                    img.style.opacity = "1";
                                });

                            clonedElement.querySelectorAll("canvas").forEach((canvas) => {
                                canvas.style.display = "none";
                            });

                            clonedElement.querySelectorAll("svg").forEach((svg) => {
                                svg.style.display = "block";
                                svg.style.visibility = "visible";
                                svg.style.opacity = "1";
                                svg.style.overflow = "visible";
                            });

                            clonedElement
                                .querySelectorAll(".recharts-wrapper")
                                .forEach((wrapper) => {
                                    wrapper.style.overflow = "visible";
                                    wrapper.style.display = "block";
                                    wrapper.style.visibility = "visible";
                                    wrapper.style.minHeight = "350px";
                                    wrapper.style.width = "100%";
                                });

                            clonedElement
                                .querySelectorAll(
                                    ".color-bar-legend, .pdf-legend-bar, .color-palette-legend"
                                )
                                .forEach((legend) => {
                                    legend.style.display = "block";
                                    legend.style.visibility = "visible";
                                    legend.style.opacity = "1";
                                });
                        },
                    });

                    document.body.removeChild(clone);

                    const imgData = canvas.toDataURL("image/png", 1.0);
                    const contentWidth = pdfWidth - 20;
                    const contentStartY = 18;
                    const contentEndY = pdfHeight - 14;
                    const maxContentHeight = contentEndY - contentStartY;

                    const imgHeight = (canvas.height * contentWidth) / canvas.width;

                    pdf.addPage();

                    addPDFHeader(pdf, pageNumber, totalPages, fieldName);

                    const sectionTitle = SECTION_TITLES[i] || `Section ${i + 1}`;
                    addSectionTitle(pdf, sectionTitle, 17);

                    if (imgHeight <= maxContentHeight - 12) {
                        pdf.addImage(imgData, "PNG", 10, 28, contentWidth, imgHeight);
                    } else {
                        let remainingHeight = imgHeight;
                        let sourceY = 0;
                        let isFirstPart = true;

                        while (remainingHeight > 0) {
                            if (!isFirstPart) {
                                pdf.addPage();
                                pageNumber++;
                                addPDFHeader(pdf, pageNumber, totalPages, fieldName);
                            }

                            const partHeight = Math.min(
                                remainingHeight,
                                maxContentHeight - (isFirstPart ? 12 : 0)
                            );
                            const sourceHeight = (partHeight / imgHeight) * canvas.height;
                            const startY = isFirstPart ? 28 : contentStartY;

                            const partCanvas = document.createElement("canvas");
                            partCanvas.width = canvas.width;
                            partCanvas.height = sourceHeight;
                            const partCtx = partCanvas.getContext("2d");
                            partCtx.drawImage(
                                canvas,
                                0,
                                sourceY,
                                canvas.width,
                                sourceHeight,
                                0,
                                0,
                                canvas.width,
                                sourceHeight
                            );

                            const partImgData = partCanvas.toDataURL("image/png", 1.0);
                            pdf.addImage(
                                partImgData,
                                "PNG",
                                10,
                                startY,
                                contentWidth,
                                partHeight
                            );

                            addPDFFooter(pdf);

                            sourceY += sourceHeight;
                            remainingHeight -= partHeight;
                            isFirstPart = false;
                        }

                        pageNumber--;
                    }

                    addPDFFooter(pdf);
                    pageNumber++;
                }

                setDownloadProgress(95);

                const fileName = `cropgen-report-${selectedFieldDetails?.fieldName ||
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
                restoreEChartsCanvases(input);

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
            processAllImages,
            processChartsAndGraphs,
            waitForResources,
            convertEChartsToImages,
            restoreEChartsCanvases,
            createCoverPage,
            getLogoBase64,
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