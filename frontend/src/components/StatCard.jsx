const StatCard = ({
  title,
  value,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
      {/* Title */}
      <p className="text-sm font-medium text-gray-500 mb-3">
        {title}
      </p>

      {/* Value */}
      <h3 className="text-4xl font-bold text-gray-900">
        {value}
      </h3>
    </div>
  );
};

export default StatCard;