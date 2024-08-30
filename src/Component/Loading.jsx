import React from "react";

export default function Loading({ isLoading }) {
  return (
    <div>
      {isLoading && (
           <div className="flex flex-col justify-center items-center mt-[21%]">
           <div className="relative flex justify-center items-center">
             {/* Outer spinner */}
             <div className="w-24 h-24 rounded-full border-4 border-dotted border-[#6c8cff] animate-spin"></div>

             {/* Middle spinner */}
             <div className="absolute w-20 h-20 rounded-full border-4 border-dotted border-[#7592fd] animate-spin"></div>

             {/* Inner spinner */}
             <div className="absolute w-16 h-16 rounded-full border-4 border-dotted border-[#82ade6] animate-pulse"></div>

             {/* Dots */}
             <div className="absolute flex justify-center items-center">
               <div className="rounded-full w-[4px] h-[4px] bg-[#7289DA] shadow-md animate-bounce "></div>
               <div className="rounded-full w-[4px] h-[4px] bg-[#7289DA] shadow-md ml-2 animate-bounce delay-100"></div>
               <div className="rounded-full w-[4px] h-[4px] bg-[#7289DA] shadow-md ml-2 animate-bounce delay-200"></div>

             </div>
           </div>

         
         </div>
      )}
    </div>
  );
}
