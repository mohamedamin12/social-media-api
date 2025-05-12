const likePostMessage = (user: string): string => {
  return `${user} liked your post!`;
};

const sharePostMessage = (user: string): string => {
  return `${user} shared your post!`;
};

const commentPostMessage = (user: string, commentMessage: string): string => {
  return `${user} commented your post: ${commentMessage}`;
};

const followPageMessage = (user: string, pageName: string): string => {
  return `${user} is now following your page: ${pageName}`;
};

const joinGroupMessage = (user: string, groupName: string): string => {
  return `${user} joined your group: ${groupName}`;
};

const leaveGroupMessage = (user: string, groupName: string): string => {
  return `${user} left your group: ${groupName}`;
};

export default {
  likePostMessage,
  sharePostMessage,
  commentPostMessage,
  followPageMessage,
  joinGroupMessage,
  leaveGroupMessage,
};