import { FaHandshake } from "react-icons/fa";
import img5 from "../../../assets/image/Frame 282.png"

const Fertigation = () => {
    return (
        <div className="bg-[#344e41] rounded-lg p-4 text-white w-full shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-[24px]">Fertigation</h2>
                <img className="w-[30px]" src={img5} alt="" />
            </div>

            <div className="bg-[#5a7c6b] p-3 rounded-md text-white mt-2 mb-3">
                <div className="flex gap-2  justify-between">
                    <p className="font-bold text-white text-[12px]">Crop: Wheat</p>
                    <p className="font-bold text-white text-[12px]">Growth stages : Flowering</p>
                </div>
                <div className="bg-white text-black rounded-md p-2 text-[12px]">
                    <div className="mt-3">
                        <ul className="list-disc  text-[12px]">
                            <li>It’s the perfect time for fertigation — soil moisture is ideal for nutrient absorption in your [Crop Name] field.</li>
                            <li>Split your nitrogen dose this week to avoid leaching losses. Next fertigation round due in 5 days.</li>
                            <li>Fertigation alert: Crop age has reached [X] days. Apply phosphorus now to boost root development.</li>
                            <li>Warning: Low potassium levels detected in [Farm Name]. Consider fertigation with K-rich solution.</li>

                        </ul>
                    </div>

                </div>

            </div>
        </div>

    );
};

export default Fertigation;
