import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
      <div className="max-w-md w-full p-8 bg-white border border-card-border rounded-custom shadow-sm">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition duration-150 shadow-sm"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};
export default NotFoundPage;
