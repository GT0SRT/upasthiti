import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { Star } from "lucide-react";

const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
        {window.innerWidth <= 767 ? (<></>):(<Sidebar/>)}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div><Navbar /></div>
            <div className="p-6">
              {/* <h1 className="text-xl font-bold mb-4 text-center">Feedback</h1> */}
              <div className="pl-5 pr-5 m-3 gap-5 flex justify-center items-center">
              
              <div className="w-[880%] md:w-[60%] rounded-2xl shadow-lg bg-gray-800 backdrop-blur-lg border border-white/20 p-6">
                <h2 className="text-xl font-semibold mb-6 text-center">Share Your Feedback</h2>
                <form className="space-y-4">

                {/* Feedback Text */}
                <div>
                    <label className="block text-gray-300 mb-1">Your Feedback</label>
                    <textarea
                    rows="6"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700/40 border border-gray-500/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Write your feedback..."
                    />
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-gray-300 mb-1">Rate Us</label>
                    <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        return (
                        <Star
                            key={i}
                            size={28}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(null)}
                            className={`cursor-pointer transition ${
                            starValue <= (hover || rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-400"
                            }`}
                        />
                        );
                    })}
                    </div>
                </div>
                <button
                    type="submit"
                    className='bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 cursor-pointer p-2 text-sm rounded-lg
                    flex font-semibold mb-2 w-full justify-center mt-auto'
                >Submit Feedback
                </button>
            </form>
            </div>

              </div>
            </div>
        </div>
    </div>
  )
}

export default Feedback