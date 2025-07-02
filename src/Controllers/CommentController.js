import { Comment } from "../Models/CommentSchema.js";
import { errHandler, responseHandler } from "../helper/response.js";

const OnComment = (req, res) => {
  const body = req.body;
  Comment.create(body)
    .then((data) => {
     
      responseHandler(res, data);
    })
    .catch(() => {
      errHandler(res, 5, errHandler);
    });
};
const DeleteComment = (req, res) => {
  const { id } = req.query;
  // console.log(id);
  Comment.findByIdAndDelete({ _id: id }).then((data) => {
    responseHandler(res, data);
  });
};
const GetComment = (req, res) => {
  let obj = {};
  let { id , commentID , email , name ,comment} = req.query;
  if (id) {
    obj.postId = id
  }
  if(commentID){
    obj._id = commentID
  }
  if(email){
    obj.email = email
  }
  if(name){
    obj.name = name
  }
  if(comment){
    let regex = new RegExp(comment, "i");
    obj.message = regex;
  }
  Comment.find(obj).sort({ createdAt: -1 })
    .then((data) => {
      responseHandler(res, data);
    })
    .catch(() => {
      errHandler(res, 5, errHandler);
    });
};

const DashBoardComment = async (req,res)=>{
  try {
    const { date } = req.query;
    let dateFilter = {};

    // If date query parameter is provided, attempt to construct date filtering criteria
    if (date) {
      const [startDate, endDate] = date.split(',');
      const isValidDate = (dateString) => !isNaN(new Date(dateString).getTime());

      if (isValidDate(startDate) && isValidDate(endDate)) {
        // Construct date filtering criteria only if both startDate and endDate are valid dates
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        };
      }
    }

    // Find all comments and apply date filtering criteria if provided
    const allComments = await Comment.find(dateFilter);

    // Count the number of comments created today
    const todayData = await Comment.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // Count of active comments
    const activeCount = allComments.length;

    // Inactive count is always 0
    const inactiveCount = 0;

    res.json({ activeCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export {OnComment,GetComment,DeleteComment,DashBoardComment}