import Lesson from "../models/Lesson.js";

/**
 * Returns a paginated list of published lessons visible to a student.
 * Only published lessons are returned — drafts and archived are never exposed.
 * Supports search, subject filter, type filter, and class filter.
 */
export const discoverLessons = async (query) => {
  const {
    page = 1,
    limit = 12,
    search,
    subject,
    type,
    classId,
  } = query;

  // Students always see only published lessons
  const filter = { status: "published" };
  if (search) filter.title = { $regex: search, $options: "i" };
  if (subject) filter.subject = subject;
  if (type) filter.type = type;
  if (classId) filter.class = classId;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [lessons, total] = await Promise.all([
    Lesson.find(filter)
      .populate("subject", "name slug icon")
      .populate("teacher", "fullName")
      .populate("class", "name")
      .select("-content -drawingSteps -questions")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Lesson.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    lessons,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: total,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  };
};
