import { flashnews } from "../Models/FlashSchema.js";
import { errHandler, responseHandler } from "../helper/response.js";

const uploadNews = (req, res) => {
  let body = req.body;
  let { id } = req.query;
  let idPrefix = "LOKFL";
  flashnews
    .create({
      _id: `${idPrefix}${id}+${Date.now()}`,
      ...body,
      userId: id,
    })
    .then((data) => {
      responseHandler(res, data);
    })
    .catch((err) => {
      console.log(err);
      errHandler(res, 5, 403);
    });
};

const updateNews = (req, res) => {
  const { id } = req.params;
  const { link, slugName } = req.body;

  // if (status !== "active" && status !== "inactive") {
  //   return errHandler(res, "Invalid status provided", 400);
  // }

  flashnews
    .findByIdAndUpdate(
      id,
      { $set: { link, slugName } },
      { new: true, useFindAndModify: false }
    )
    .then((data) => {
      if (data) {
        responseHandler(res, data);
      } else {
        errHandler(res, "News item not found", 404);
      }
    })
    .catch((err) => {
      console.log(err);
      errHandler(res, "Internal Server Error", 500);
    });
};

const updateNewsStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "active" && status !== "inactive") {
    return errHandler(res, "Invalid status provided", 400);
  }

  flashnews
    .findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, useFindAndModify: false }
    )
    .then((data) => {
      if (data) {
        responseHandler(res, data);
      } else {
        errHandler(res, "News item not found", 404);
      }
    })
    .catch((err) => {
      console.log(err);
      errHandler(res, "Internal Server Error", 500);
    });
};

const getAllNews = (req, res) => {
  flashnews
    .find({})
    .then((data) => {
      responseHandler(res, data);
    })
    .catch(() => {
      errHandler(res, "not Found", 404);
    });
};

const DashBoardFlashNews = async (req, res) => {
  try {
    const { date } = req.query;
    let dateFilter = {};

    // If date query parameter is provided, attempt to construct date filtering criteria
    if (date) {
      const [startDate, endDate] = date.split(",");
      const isValidDate = (dateString) =>
        !isNaN(new Date(dateString).getTime());

      if (isValidDate(startDate) && isValidDate(endDate)) {
        // Construct date filtering criteria only if both startDate and endDate are valid dates
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        };
      }
    }

    // Find all flash news and apply date filtering criteria if provided
    const allFlashNews = await flashnews.find(dateFilter);

    // Count the number of flash news created today
    const today = new Date();
    const todayData = await flashnews.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Filter active flash news
    const activeFlashNews = allFlashNews.filter(
      (news) => news.status === "active"
    );

    // Filter inactive flash news
    const inactiveFlashNews = allFlashNews.filter(
      (news) => news.status === "inactive"
    );

    // Count of active flash news
    const activeFlashNewsCount = activeFlashNews.length;

    // Count of inactive flash news
    const inactiveFlashNewsCount = inactiveFlashNews.length;

    res.json({
      activeCount: activeFlashNewsCount,
      inactiveCount: inactiveFlashNewsCount,
      todayData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  uploadNews,
  getAllNews,
  updateNews,
  updateNewsStatus,
  DashBoardFlashNews,
};
