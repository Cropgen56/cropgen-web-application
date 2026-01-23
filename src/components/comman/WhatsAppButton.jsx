const WhatsAppButton = () => {
  const message =
  "Hello, I am using the CropGen platform and would like to receive advisory for my field. Please guide me.";

  const whatsappUrl = `https://wa.me/917709476236?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        backgroundColor: "#25D366",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        zIndex: 9999,
        cursor: "pointer"
      }}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        style={{ width: "28px", height: "28px" }}
      />
    </a>
  );
};

export default WhatsAppButton;
