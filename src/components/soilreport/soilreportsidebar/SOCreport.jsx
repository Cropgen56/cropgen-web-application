import React from 'react'
import soc1 from "../../../assets/Untitled design (27).png"
import soc2 from "../../../assets/soc img.svg"

const SOCreport = (isdownloading) => {
  return (
    <div className=' flex  flex-col justify-center items-center mt-5 bg-white rounded-xl shadow-md p-2 h-[370px]'>
          
      <div className="flex items-center justify-center h-full w-full p-4 bg-green  rounded-lg gap-5">

      
        <img src={soc1} alt="previous image"  className='w-[45%] border border-black rounded-xl mt-12'/>
        
        {/* Gradient Bar with labels wrapper */}
         <div className='flex flex-col items-center justify-center h-full gap-1.5'>
              <h2 className="text-2xl font-bold  mt-2">Soil Surface SOC  <span className='text-sm'>(0=low,3=high)</span></h2>
        <div className='flex items-center justify-center h-full gap-3'>
              <div className="relative flex items-center ">
          {/* Gradient Bar */}
          <div className="h-[300px] w-[30px] rounded overflow-hidden bg-gradient-to-t from-[#9b0020] via-[#f77d4c] via-30% via-[#fff8b2] via-50% via-[#84cc81] to-[#005b3c]" />
          {/* Y-axis Labels */}
          <div className="absolute left-full ml-2 h-[300px] flex flex-col justify-between text-black text-sm">
            <span>3</span>
            <span className="mt-[60px]">2</span>
            <span className="mt-[60px]">1</span>
            <span>0</span>
          </div>
        </div>
        <img src={soc2} alt="SOCimage"  className='w-[50]'/>
        </div>
         </div>
      </div>
    </div>

  
  )
}

export default SOCreport