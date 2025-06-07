import PropTypes from "prop-types";
import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import socket from "../../socket";

const NotificationDropdown = ({ notifications, onClose }) => {
  const [combinedNotifications, setCombinedNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const { userId } = useContext(AuthContext);
  const handledNotifIds = useRef(new Set());

useEffect(() => {
  if (!notifications || notifications.length === 0) return;

  const sorted = [...notifications].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  setCombinedNotifications(sorted);
}, [notifications]);


  useEffect(() => {
    if (notifications.length > 0 && userId) {
      const unreadNotifications = notifications.filter((notif) => {
        const notifId = notif._id || notif.id;
        const isAlreadyHandled = handledNotifIds.current.has(notifId);
        const isUnread = !notif.readBy?.includes(userId);
        return !isAlreadyHandled && isUnread;
      });

      unreadNotifications.forEach((notif) => {
        const notifId = notif._id || notif.id;
        socket.emit("markAsRead", {
          notificationId: notifId,
          userId,
        });
        handledNotifIds.current.add(notifId);
      });

      setCombinedNotifications((prev) =>
        prev.map((notif) =>
          unreadNotifications.some((u) => (u._id || u.id) === (notif._id || notif.id))
            ? {
                ...notif,
                isRead: true,
                readBy: [...(notif.readBy || []), userId],
              }
            : notif
        )
      );
    }
  }, [notifications, userId]);

  const normalizedNotifications = combinedNotifications.map((notif, index) => {
    if (notif && typeof notif === "object" && notif.message) {
      return notif;
    }
    return {
      id: notif?.id || `temp-${index}`,
      message:
        typeof notif === "string"
          ? notif
          : notif?.message || JSON.stringify(notif) || "Notification",
      isRead: notif?.isRead || false,
      createdAt: notif?.createdAt || new Date().toISOString(),
      ...notif,
    };
  });

  const displayedNotifications = showAllNotifications
    ? normalizedNotifications
    : normalizedNotifications.slice(0, 5);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleNotificationClick = (notifId) => {
    if (!notifId || !userId) return;

    socket.emit("markAsRead", {
      notificationId: notifId,
      userId,
    });

    setCombinedNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        (notif._id || notif.id) === notifId
          ? {
              ...notif,
              isRead: true,
              readBy: [...(notif.readBy || []), userId],
            }
          : notif
      )
    );
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50">
      <div className="p-4">
        <h3 className="mb-3 text-lg font-bold dark:text-white">Notifications</h3>

        <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
          {displayedNotifications.length === 0 ? (
            <li className="text-gray-500 dark:text-gray-300">No notifications</li>
          ) : (
            displayedNotifications.map((notif, index) => (
              <li
                key={notif.id || notif._id || index}
                className={`rounded-md p-2 break-words ${
                  notif.isRead ? "bg-gray-200" : "bg-yellow-100"
                } dark:${notif.isRead ? "bg-slate-700" : "bg-yellow-600"} dark:text-gray-200`}
                onClick={() => handleNotificationClick(notif.id || notif._id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    {notif.message.includes("completed vaccines are:") ? (
                      <>
                        {notif.message.split("completed vaccines are:")[0]}
                        <span className="font-semibold">
                          completed vaccines are:{" "}
                          {notif.message.split("completed vaccines are:")[1].trim()}
                        </span>
                      </>
                    ) : (
                      notif.message
                    )}
                  </div>
                  {!notif.readBy?.includes(userId) && (
                    <span className="ml-2 inline-block w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {notif.createdAt ? formatDate(notif.createdAt) : "No date"}
                </div>
              </li>
            ))
          )}
        </ul>

        {normalizedNotifications.length > 5 && !showAllNotifications && (
          <div className="mt-4 text-center">
            <button
              className="text-blue-600 hover:underline dark:text-blue-400"
              onClick={() => setShowAllNotifications(true)}
            >
              View All Notifications
            </button>
          </div>
        )}

        {showAllNotifications && (
          <div className="mt-4 text-center">
            <button
              className="text-blue-600 hover:underline dark:text-blue-400"
              onClick={() => {
                setShowAllNotifications(false);
                onClose();
              }}
            >
              Hide Some Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

NotificationDropdown.propTypes = {
  onClose: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        message: PropTypes.string.isRequired,
        id: PropTypes.string,
        _id: PropTypes.string,
        createdAt: PropTypes.string,
        isRead: PropTypes.bool,
        readBy: PropTypes.array,
      }),
      PropTypes.string,
    ])
  ).isRequired,
};

export default NotificationDropdown;
