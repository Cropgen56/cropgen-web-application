import img3 from "../../../assets/image/Frame 268.png"

const PestDiseaseCard = () => {
  return (
    <div className="bg-[#344e41] rounded-lg p-4 text-white w-full shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-[24px]">Disease & Pest</h2>
        <img className="w-[30px]" src={img3} alt="" />
      </div>

      <div className="bg-white text-black rounded-md p-3 text-sm space-y-3 h-[100%] flex flex-col justify-center items-center">
        <div>
          <p className="font-bold">• Aphid Risk - <span className="text-yellow-500 font-medium">Medium</span></p>
          <p className="text-[12px]">
            Predators such as ladybird beetles, lace wings, and Nabid bugs will typically keep aphid populations below economic thresholds. It is very rare to have aphid populations without predators feeding on it. Maintaining untreated refuges without insecticides may conserve natural enemies and contribute to natural control.
          </p>
        </div>
        <div>
          <p className="font-bold">• Rust Disease - <span className="text-green-500 font-medium">Low</span></p>
          <p>Use rust-resistant wheat varieties and follow timely sowing.Monitor for early signs and spray Propiconazole if needed..</p>
        </div>
      </div>
    </div>

  );
};

export default PestDiseaseCard;
