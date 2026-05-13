import React, { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'


const InfoCards = ({ title, number, percentage, backgroundColor }) => {
  const [displayPercentage, setDisplayPercentage] = useState(
    typeof percentage === 'number' ? 0 : null
  )

  useEffect(() => {
    // Only animate when a numeric percentage is provided
    if (typeof percentage !== 'number') return undefined

    setDisplayPercentage(0)
    let mounted = true
    const target = Math.max(0, percentage)
    const step = 5

    const interval = setInterval(() => {
      setDisplayPercentage((prev) => {
        if (!mounted) return prev
        const next = (prev || 0) + step
        if (next >= target) {
          clearInterval(interval)
          return Math.round(target)
        }
        return next
      })
    }, 1000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [percentage])

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

        {typeof displayPercentage === 'number' && (
          <p className="text-[12px] leading-[14px] flex justify-center items-center gap-1  whitespace-nowrap">
            +{displayPercentage}%
            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </p>
        )}
      </div>
    </div>
  )
}

export default InfoCards
