const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-72 gap-4">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>

        <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800">
          Loading...
        </p>

        <p className="text-sm text-gray-500">
          Please wait a moment
        </p>
      </div>
    </div>
  );
};

export default Loader;