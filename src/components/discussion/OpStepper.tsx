import React, { useState } from 'react'
import { ChevronUp, ChevronDown, UserCheck } from 'lucide-react'

interface OpStepperProps {
  opCommentIds: number[]
}

export const OpStepper: React.FC<OpStepperProps> = ({ opCommentIds }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (opCommentIds.length === 0) return null

  const jumpToComment = (index: number) => {
    const targetId = opCommentIds[index]
    const el = document.getElementById(`comment-${targetId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-[#ff6600]/10')
      setTimeout(() => {
        el.classList.remove('bg-[#ff6600]/10')
      }, 1500)
    }
    setCurrentIndex(index)
  }

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % opCommentIds.length
    jumpToComment(nextIdx)
  }

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + opCommentIds.length) % opCommentIds.length
    jumpToComment(prevIdx)
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-white/[0.08] rounded-full text-xs font-mono-meta text-[#a0a0a0]">
      <span className="flex items-center gap-1 text-[#ff6600] font-medium">
        <UserCheck className="w-3 h-3" />
        <span>OP</span>
      </span>
      <span className="text-[#666666]">
        {currentIndex + 1}/{opCommentIds.length}
      </span>
      <div className="flex items-center gap-0.5 ml-1">
        <button
          onClick={handlePrev}
          title="Previous OP comment"
          className="p-1 hover:text-white rounded transition-colors cursor-pointer"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          onClick={handleNext}
          title="Next OP comment"
          className="p-1 hover:text-white rounded transition-colors cursor-pointer"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
