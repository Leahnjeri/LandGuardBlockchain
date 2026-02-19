export default function SearchRequestStatus({ status }) {
  if (status === "pending") {
    return (
      <div className="bg-yellow-100 p-4 rounded">
        ⏳ Your land search request is awaiting owner approval
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="bg-red-100 p-4 rounded">
        ❌ The land owner has rejected your request
      </div>
    );
  }

  return null;
}
