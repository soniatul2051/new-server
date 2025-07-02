import { Video } from "../Models/videoSchema.js";
import { validationResult } from "express-validator";
import { responseHandler } from "../helper/response.js";

const createVideo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, image, link, reportedBy } = req.body;
    const newVideo = new Video({ title, image, link, reportedBy });
    const savedVideo = await newVideo.save();
    res.json(savedVideo);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const DeleteVideo = (req, res) => {
  const { id } = req.query;
  // console.log(id);
  Video.findByIdAndDelete({ _id: id }).then((data) => {
    responseHandler(res, data);
  });
};

const getAllVideos = async (req, res) => {
  try {
    let { id, title, status } = req.query;
    let obj = {};
    if (id) {
      obj._id = id;
    }
    if (title) {
      let regex = new RegExp(title, "i");
      obj.title = regex;
    }
    if (status) {
      obj.status = status;
    }
    const allVideos = await Video.find(obj).sort({ createdAt: -1 });
    // const reversedVideos = allVideos;
    res.json(allVideos.slice(0, 6));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const approvedVideos = (req, res) => {
  let { id } = req.params;
  let body = req.body;

  Video.findByIdAndUpdate({ _id: id }, body, { new: true })
    .then((data) => {
      responseHandler(res, {
        data,
      });
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};

const getVideo = (req, res) => {
  let { id } = req.params;

  Video.findById({ _id: id })
    .then((data) => {
      responseHandler(res, {
        data,
      });
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};
const DashBoardVideos = async (req, res) => {
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

    // Find all videos and apply date filtering criteria if provided
    const allVideos = await Video.find(dateFilter);

    // Count the number of videos created today
    const today = new Date();
    const todayData = await Video.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Filter active videos
    const activeVideos = allVideos.filter((video) => video.status === true);

    // Filter inactive videos
    const inactiveVideos = allVideos.filter((video) => video.status === false);

    // Count of active videos
    const activeVideosCount = activeVideos.length;

    // Count of inactive videos
    const inactiveVideosCount = inactiveVideos.length;

    res.json({
      activeCount: activeVideosCount,
      inactiveCount: inactiveVideosCount,
      todayData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export {
  createVideo,
  getAllVideos,
  getVideo,
  approvedVideos,
  DeleteVideo,
  DashBoardVideos,
};
