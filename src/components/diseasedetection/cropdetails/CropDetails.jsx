import React from "react";
// import "./CropDetails.css";

const CropDetails = ({closeModal}) => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-[80%] h-[90vh] max-w-[900px] bg-white rounded-lg shadow-md p-5 flex flex-col justify-start mx-auto my-auto">
         <button
          onClick={closeModal}
          className="flex justify-end text-[#344e41] font-bold text-xl"
        >
          &times;
        </button>
        {/* Image Section */}
        <div className="flex gap-4 justify-between w-full">
          <img
            src="https://via.placeholder.com/150"
            alt="Leaf"
            className="w-[250px] h-[150px] object-cover rounded-md border border-[#ccc]"
          />
          <img
            src="https://via.placeholder.com/150"
            alt="Leaf"
            className="w-[250px] h-[150px] object-cover rounded-md border border-[#ccc]"
          />
          <div className="flex items-center justify-center w-[250px] h-[150px] bg-[#5a7c6b] rounded-md cursor-pointer">
            <div className="flex flex-col justify-center items-center text-white text-xl">
              <span className="text-4xl">+</span>
              <p className="text-xs mt-1">Add More</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form className="w-[40%] max-w-[600px] ml-12 flex flex-col gap-2 text-[#344e41]">
          <div className="flex flex-row justify-between items-center gap-3">
            <label htmlFor="crop-name" className="text-lg text-[#344e41] font-medium ">
              Crop Name 
            </label>
            <input
              id="crop-name"
              type="text"
              className="px-2 py-1 text-sm rounded-md outline-none bg-[#5a7c6bb2] border-none"
            />
          </div>
          <div className="form-group flex justify-between items-center gap-4">
            <label htmlFor="disease" className="text-lg text-[#344e41] font-medium ">
              Disease 
            </label>
            <input
              id="disease"
              type="text"
              className="px-2 py-1 text-sm rounded-md outline-none bg-[#5a7c6bb2] border-none"
            />
          </div>
          <div className="form-group flex justify-between items-center gap-3">
            <label htmlFor="treatment" className="text-lg text-[#344e41] font-medium">
              Treatment
            </label>
            <input
              id="treatment"
              type="text"
              className="px-2 py-1 text-sm rounded-md outline-none bg-[#5a7c6bb2] border-none"
            />
          </div>

          {/* Feedback Section */}
          <h2 className="text-base font-bold text-[#344e41]">Tell us about Treatment</h2>
          <p className="text-base font-semibold p-0 m-0">
            Do you Like Treatment / Is it Helpful to?
          </p>
          <div className="flex gap-5 my-3">
            <div className="flex items-center gap-2 text-sm text-[#344e41]">
              <input type="radio" id="yes" name="feedback" />
              <label htmlFor="yes" className="flex items-center gap-2 text-sm text-[#344e41]">
                Yes
              </label>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#344e41]">
              <input type="radio" id="no" name="feedback" />
              <label htmlFor="no" className="flex items-center gap-2 text-sm text-[#344e41]">
                No
              </label>
            </div>
          </div>

          {/* Comment Box */}
          <textarea 
            rows="3"
            placeholder="Leave your comments"
            className="w-full p-2 text-sm rounded-md border border-[#ccc] outline-none resize-none bg-[#5a7c6bb2] "
          ></textarea>
        </form>
      </div>
    </div>
  );
};

export default CropDetails;
