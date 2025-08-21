import React from "react";

export default function RecentGroups({ groups }) {
  const groupEntries = Array.isArray(groups)
    ? groups
    : Object.entries(groups || {});
  const recentGroups = groupEntries.slice(-5).reverse();

  return (
    <div className="mt-3 p-4 bg-gray-800/30 border border-gray-700 rounded-xl md:w-[93%]  m-9">
      <h2 className="text-lg font-semibold mb-2">Recent Groups</h2>
      {
        recentGroups.length === 0 ? (
          <p className="text-gray-400">No groups found.</p>
        ):(<ul>
            {recentGroups.map(([groupName]) => (
              <li key={groupName} className="border-b border-gray-700 py-2">
                <span className="font-medium text-gray-500 text-sm">{groupName}</span>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
