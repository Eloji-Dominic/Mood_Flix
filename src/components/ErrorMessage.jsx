import React from 'react'
import './ErrorMessage.css';

const ErrorMessage = ({ fetchMovies }) => {
  return(
    <div>
      <p className="text-red-500">We couldn't process your request due to bad internet connection.</p>
      <button className='color-white' onClick={fetchMovies}>Try again</button>
    </div>
  );
}

export default ErrorMessage