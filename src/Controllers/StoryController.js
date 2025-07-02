import { Story } from "../Models/StoriesSchema.js";
import { validationResult } from "express-validator";
import { responseHandler } from "../helper/response.js";

const createStory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, image, imageTexts, periority, albumPeriority } = req.body;
    let img = image;
    if (!Array.isArray(image)) {
      img = [image];
    }
    const newStory = new Story({
      title: title,
      periority: periority,
      images: img.map((i, index) => ({
        img: i,
        text: imageTexts[index],
        albumPeriority: albumPeriority[index],
      })),
    });
    const savedStory = await newStory.save();
    res.json(savedStory);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const getStoryById = async (req, res) => {
  try {
    const article = await Story.findById(req.params.id);
    if (!article) {
      return res.status(404).send("Article not found");
    }
    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const DeleteStory = (req, res) => {
  const { id } = req.query;
  Story.findByIdAndDelete({ _id: id }).then((data) => {
    responseHandler(res, data);
  });
};

const getAllStories = async (req, res) => {
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
    const allStories = await Story.find(obj);
    const reversedStories = allStories.reverse();
    res.json(reversedStories.slice(0, 10));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const approvedStories = (req, res) => {
  let { id } = req.params;
  let body = req.body;

  Story.findByIdAndUpdate({ _id: id }, body, { new: true })
    .then((data) => {
      responseHandler(res, {
        data,
      });
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};
const DashBoardStories = async (req, res) => {
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

    // Find all stories and apply date filtering criteria if provided
    const allStories = await Story.find(dateFilter);

    // Count the number of stories created today
    const today = new Date();
    const todayData = await Story.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Filter active stories
    const activeStories = allStories.filter((story) => story.status === true);

    // Filter inactive stories
    const inactiveStories = allStories.filter(
      (story) => story.status === false
    );

    // Count of active stories
    const activeStoriesCount = activeStories.length;

    // Count of inactive stories
    const inactiveStoriesCount = inactiveStories.length;

    res.json({
      activeCount: activeStoriesCount,
      inactiveCount: inactiveStoriesCount,
      todayData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export {
  createStory,
  getStoryById,
  getAllStories,
  DeleteStory,
  approvedStories,
  DashBoardStories,
};
