const ProjectCard = ({
  project,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white shadow rounded-lg p-5 border cursor-pointer hover:shadow-md transition"
    >
      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Admin */}
      <div className="text-sm mb-2">
        <span className="font-medium">
          Admin:
        </span>{" "}
        {project.admin?.name ||
          "Unknown"}
      </div>

      {/* Members */}
      <div className="text-sm text-gray-700">
        <span className="font-medium">
          Members:
        </span>{" "}
        {project.members?.length || 0}
      </div>
    </div>
  );
};

export default ProjectCard;