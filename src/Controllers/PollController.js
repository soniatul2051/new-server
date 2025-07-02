import { Poll } from "../Models/PollSchema.js";
import { errHandler, responseHandler } from "../helper/response.js";

const createPoll = async (req, res) => {
  const { question, options } = req.body;
  try {
    const newPoll = new Poll({ question, options });
    await newPoll.save();
    const allPolls = await Poll.find();
    res.json(allPolls);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updatePool = async (req, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body;

  try {
    const poll = await Poll.findById(id);
    poll.options[optionIndex].votes += 1;
    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deletePools = (req, res) => {
  const { id } = req.params;
  console.log(id);
  Poll.findByIdAndDelete({ _id: id }).then((data) => {
    responseHandler(res, {
      message: "Poll Deleted Successfully",
      data: data,
      status: 200,
    });
  });
};

// Import necessary modules and Poll model

const getAllPolls = async (req, res) => {
  try {
    const { id, question } = req.query;
    let obj = {};
    if (id) {
      obj._id = id;
    }

    if (question) {
      let regex = new RegExp(question, "i");
      obj.question = regex;
    }

    // Retrieve all polls from the database
    const allPolls = await Poll.find(obj);

    // Calculate option percentages and votes for each poll
    const pollsWithVotesAndPercentages = allPolls.map((poll) => {
      const totalVotes = poll.options.reduce(
        (acc, option) => acc + option.votes,
        0
      );

      const optionsWithVotesAndPercentage = poll.options.map((option) => ({
        optionText: option.optionText,
        votes: option.votes,
        percentage: totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100,
      }));

      return {
        _id: poll._id,
        question: poll.question,
        options: optionsWithVotesAndPercentage,
      };
    });

    // Respond with the polls including question, answers, votes, and option percentages
    res.json(pollsWithVotesAndPercentages);
  } catch (error) {
    console.log("err", error);
    // Handle errors
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const DashboardPoll = async (req, res) => {
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

    // Find all polls and apply date filtering criteria if provided
    const allPolls = await Poll.find(dateFilter);

    // Count the number of polls created today
    const todayData = await Poll.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    // Count of active polls
    const activeCount = allPolls.length;

    // Inactive count is always 0 for polls
    const inactiveCount = 0;

    res.json({ activeCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { createPoll, updatePool, deletePools, getAllPolls, DashboardPoll };
