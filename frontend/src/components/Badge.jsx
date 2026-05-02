const STYLES = {
  status: {
    "To Do":       "bg-gray-100   text-gray-700   border-gray-300",
    "In Progress": "bg-amber-100  text-amber-800  border-amber-300",
    "Done":        "bg-green-100  text-green-800  border-green-300",
    "Admin":       "bg-blue-100   text-blue-800   border-blue-300",
    "Member":      "bg-purple-100 text-purple-800 border-purple-300",
  },
  priority: {
    "Low":    "bg-blue-100  text-blue-800  border-blue-300",
    "Medium": "bg-amber-100 text-amber-800 border-amber-300",
    "High":   "bg-red-100   text-red-800   border-red-300",
  },
};

const DOT_COLORS = {
  status: {
    "To Do":       "bg-gray-400",
    "In Progress": "bg-amber-500",
    "Done":        "bg-green-500",
    "Admin":       "bg-blue-500",
    "Member":      "bg-purple-500",
  },
  priority: {
    "Low":    "bg-blue-500",
    "Medium": "bg-amber-500",
    "High":   "bg-red-500",
  },
};

const Badge = ({ text, type }) => {
  const badgeStyle =
    STYLES[type]?.[text] ?? "bg-gray-100 text-gray-700 border-gray-300";
  const dotColor =
    DOT_COLORS[type]?.[text] ?? "bg-gray-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {text}
    </span>
  );
};

export default Badge;