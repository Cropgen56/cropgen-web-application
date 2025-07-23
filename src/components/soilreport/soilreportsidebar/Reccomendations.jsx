import React from 'react'

const Reccomendations = () => {
  return (
    <div className='flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md'>
        <h3 className='text-xl font-semibold text-[#344e41]'>Recommendations</h3>
        <ul className='list-disc pl-5 text-gray-700 '>
            <li>Ensure proper irrigation practices to maintain soil moisture.</li>
            <li>Apply organic matter to improve soil structure and fertility.</li>
            <li>Monitor soil pH regularly and adjust as needed for optimal crop growth.</li>
            <li>Consider crop rotation to enhance soil health and reduce pest pressure.</li>
        </ul>
    </div>
  )
}

export default Reccomendations
