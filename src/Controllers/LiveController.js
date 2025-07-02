import Live from "../Models/LiveSchema.js";
import { errHandler, responseHandler } from "../helper/response.js";

const LiveStream = (req, res) => {
  const body = req.body;
  Live.create(body)
    .then(() => {
      Live.find().then((data) => {
        responseHandler(res, data.reverse());
      });
    })
    .catch(() => {
      errHandler(res, 5, 403);
    });
};

const GetLiveStream = (req, res) => {
  const { id, title } = req.query;
  let obj = {};
  if (id) {
    obj._id = id;
  }

  if (title) {
    let regex = new RegExp(title, "i");
    obj.title = regex;
  }
  Live.find(obj)
    .then((data) => {
      responseHandler(res, data);
    })
    .catch(() => {
      errHandler(res, 5, 403);
    });
};

const DeleteLiveStream = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return errHandler(res, "ID is required", 400);
  }

  Live.findByIdAndDelete(id)
    .then((deletedLiveStream) => {
      if (!deletedLiveStream) {
        return errHandler(res, "Live stream not found", 404);
      }
      responseHandler(res, {
        message: "Live stream deleted successfully",
        deletedLiveStream,
      });
    })
    .catch((err) => {
      errHandler(res, "Failed to delete live stream", 500);
    });
};

const DashBoardLive = async (req, res) => {
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

    // Find all live streams and apply date filtering criteria if provided
    const allLiveStreams = await Live.find(dateFilter);

    // Count the number of live streams created today
    const todayData = await Live.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    // Count of active live streams
    const activeCount = allLiveStreams.length;

    // Inactive count is always 0 for live streams
    const inactiveCount = 0;

    res.json({ activeCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export { LiveStream, GetLiveStream, DashBoardLive, DeleteLiveStream };
