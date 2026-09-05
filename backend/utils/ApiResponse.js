/** Sends a consistently-shaped success response: { success, message, data }. */
export const sendSuccess = (res, { statusCode = 200, message, data = null }) => {
  return res.status(statusCode).json({ success: true, message, data });
};
