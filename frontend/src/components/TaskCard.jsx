import Badge from "./Badge";
import { useAuth } from "../context/AuthContext";

const TaskCard = ({
  task,
  isAdmin = false,
  onStatusUpdate,
  onDelete,
}) => {
  const { user } = useAuth();

  // Admin or assigned member can update
  const canUpdate =
    isAdmin ||
    task.assignedTo?._id === user?.id;

  return (
    <div className="bg-white shadow rounded-lg p-5 border">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        {/* Left */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">
            {task.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3">
            {task.description}
          </p>

          <p className="text-sm mb-1">
            <span className="font-medium">
              Assigned To:
            </span>{" "}
            {task.assignedTo?.name ||
              "Unassigned"}
          </p>

          <p className="text-sm mb-1">
            <span className="font-medium">
              Created By:
            </span>{" "}
            {task.createdBy?.name ||
              "Unknown"}
          </p>

          <p className="text-sm">
            <span className="font-medium">
              Due Date:
            </span>{" "}
            {new Date(
              task.dueDate
            ).toLocaleDateString()}
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-3 min-w-36">
          <Badge
            text={task.priority}
            type="priority"
          />

          {canUpdate ? (
            <select
              value={task.status}
              onChange={(e) =>
                onStatusUpdate(
                  task._id,
                  e.target.value
                )
              }
              className="border rounded px-2 py-1"
            >
              <option>To Do</option>
              <option>
                In Progress
              </option>
              <option>Done</option>
            </select>
          ) : (
            <Badge
              text={task.status}
              type="status"
            />
          )}

          {isAdmin && (
            <button
              onClick={() =>
                onDelete(task._id)
              }
              className="text-red-600 text-sm hover:underline"
            >
              Delete Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;