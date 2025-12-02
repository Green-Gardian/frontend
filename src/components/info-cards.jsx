import React from 'react'
import { ArrowUpRight } from 'lucide-react'



const InfoCards = ({ title, number, backgroundColor }) => {
  return (
    <div className={`
      h-[112px] 
      w-full 
      min-w-[200px]
      lg:max-w-[250px]
      md:max-w-[220px] 
      border-none 
      rounded-[16px] 
      text-[#121212] 
      p-4 
      ${backgroundColor} 
      flex 
      flex-col 
      gap-y-3
      transition-all 
      duration-200 
      hover:shadow-md
    `}>
      <h3 className='text-[14px] font-medium font-inter leading-tight'>
        {title}
      </h3>
    
      <div className='flex justify-between items-center'>
        <p className='text-[20px] sm:text-[24px] font-semibold truncate pr-2'>
          {number}
        </p>

        {/* <p className="text-[12px] leading-[14px] flex justify-center items-center gap-1  whitespace-nowrap">
          +{percentage}% 
          <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </p> */}
      </div>
    </div>
  )
}

export default InfoCards
