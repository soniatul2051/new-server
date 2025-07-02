import {
  Article,
  Content,
  Report,
  SubCategory,
} from "../Models/ArticleSchema.js";
import { User } from "../Models/UserSchema.js";
import { errHandler, responseHandler } from "../helper/response.js";
import { Storage } from "../Config/firebase.config.js";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { ObjectId } from "mongodb";
import { response } from "express";
import {translate} from '@vitalets/google-translate-api';
// const getArticle = (req, res) => {
//   let {
//     approved,
//     keyword,
//     category,
//     search,
//     id,
//     date,
//     reportedBy,
//     publishBy,
//     newsType,
//     type,
//     page,
//     limit,
//     pagenation,
//     subCategory,
//   } = req.query;
//   let obj = { approved: false };
//   if (approved) {
//     obj.approved = true;
//   }
//   if (id) {
//     obj._id = id;
//   }
//   if (keyword) {
//     obj.keyWord = keyword;
//   }
//   if (category) {
//     obj.topic = category;
//   }
//   if (search) {
//     let regex = new RegExp(search, "i");
//     obj.title = regex;
//   }
//   if (date) {
//     obj.date = date;
//   }
//   if (reportedBy) {
//     obj.reportedBy = reportedBy;
//   }
//   if (publishBy) {
//     obj.publishBy = publishBy;
//   }
//   if (newsType) {
//     obj.newsType = newsType;
//   }
//   if (type) {
//     obj.type = type;
//   }
//   if (subCategory) {
//     obj.subCategory = subCategory;
//   }
//   page = Number(page || 1);
//   limit = Number(limit || 6);
//   const skip = (page - 1) * limit;
//   console.log(obj)
//   if (pagenation) {
//     Article.find(obj)
//       .skip(skip)
//       .limit(limit)
//       .then((data) => {
//         responseHandler(res, data);
//       });
//   } else {
//     Article.find(obj).then((data) => {
//       responseHandler(res, data);
//     });
//   }
// };
const fetchSliderBreakingNews = async (limit, obj) => {
  try {
    // First get explicitly sequenced articles (1 and 2)
    const sliderArticles = await Article.find({
      ...obj,
      sequence: { $in: [1, 2] },
      status: 'online'
    })
    .sort({ sequence: 1 }) // Sort by sequence (1 first, then 2)
    .limit(limit);

    // If we don't have enough sequenced articles, fill with priority articles
    if (sliderArticles.length < limit) {
      const remaining = limit - sliderArticles.length;
      const priorityArticles = await Article.find({
        ...obj,
        priority: true,
        sequence: { $ne: 1, $ne: 2 }, // Exclude already sequenced articles
        status: 'online'
      })
      .sort({ createdAt: -1 })
      .limit(remaining);
      
      return [...sliderArticles, ...priorityArticles];
    }

    return sliderArticles;
  } catch (error) {
    console.error("Error fetching slider articles:", error);
    throw error;
  }
};

// try {
//   // Query breaking news articles with sliders = true, sorted by date
//   let breakingNews = await Article.find({ newsType: "breakingNews" })
//     .sort({ slider: -1, priority: -1, date: -1 }) // Sort by slider, then priority, then date
//     .limit(4); // Limit to 4 articles

//   // If there are fewer than 4 slider articles, fill the remaining slots with non-slider articles
//   if (breakingNews.length < 4) {
//     const remainingSlots = 4 - breakingNews.length;
//     const additionalArticles = await Article.find({ newsType: "breakingNews", slider: false })
//       .sort({ priority: -1, date: -1 }) // Sort by priority, then date
//       .limit(remainingSlots);
//     breakingNews = [...breakingNews, ...additionalArticles];
//   }

//   // If there are still fewer than 4 articles, fill the remaining slots with any breaking news articles
//   if (breakingNews.length < 4) {
//     const remainingSlots = 4 - breakingNews.length;
//     const additionalArticles = await Article.find({ newsType: "breakingNews" })
//       .sort({ priority: -1, date: -1 }) // Sort by priority, then date
//       .skip(breakingNews.length) // Skip already included articles
//       .limit(remainingSlots);
//     breakingNews = [...breakingNews, ...additionalArticles];
//   }

//   return breakingNews.slice(0, 4); // Return the first 4 articles
// } catch (error) {
//   console.error("Error fetching breaking news:", error);
//   throw error;
// }
// };

const fetchPriortyArticles = async (limit, obj) => {
  try {
    const uploadedArticles = await Article.aggregate([
      { $match: obj }, // Filter
      { $sort: { priority: -1, createdAt: -1 } }, // Sort by priority (true first) and then by createdAt
      { $limit: limit }, // Limit the result to the specified number of articles
    ]);

    return uploadedArticles;
  } catch (error) {
    console.error("Error fetching uploaded articles:", error);
    throw error;
  }
};

const getArticle = async (req, res) => {
  let {
    approved,
    keyword,
    category,
    search,
    id,
    date,
    reportedBy,
    publishBy,
    newsType,
    type,
    page,
    limit,
    pagenation,
    subCategory,
    status,
    slider,
    priority,
    url,
  } = req.query;

  let obj = { approved: false };

  if (approved) {
    obj.approved = true;
  }
  if (id) {
    obj._id = id;
  }
  if (status) {
    obj.status = status;
  }

  // Initialize an array to hold the conditions for keyword, category, and search
  let orConditions = [];

  if (keyword) {
    orConditions.push({ keyWord: keyword });
  }
  if (category) {
    let regex = new RegExp(category, "i");
    obj.topic = regex; // Changed to directly assign to obj.topic
  }
  if (search) {
    let regex = new RegExp(search, "i");
    orConditions.push({ title: regex });
  }

  // If there are any conditions, add them to the query object using $or
  if (orConditions.length > 0) {
    obj.$or = orConditions;
  }

  if (date) {
    if (typeof date === "string" && date.trim() !== "") {
      const dateRange = date.split(",").filter(Boolean);
      if (dateRange.length === 2) {
        obj.date = { $gte: dateRange[0], $lte: dateRange[1] };
      }
    }
  }

  if (reportedBy) {
    obj.reportedBy = reportedBy;
  }
  if (publishBy) {
    obj.publishBy = publishBy;
  }
  if (newsType) {
    obj.newsType = newsType;
  }
  if (type) {
    obj.type = type;
  }
  if (subCategory) {
    let regex = new RegExp(subCategory, "i");
    obj.subCategory = regex;
  }

  // Modified slider logic to include category filtering
  if (slider) {
    limit = Number(limit || 4);
    try {
      // First get explicitly sequenced articles (1 and 2) with category filter
      const sliderArticles = await Article.find({
        ...obj,
        sequence: { $in: [1, 2] },
        status: 'online'
      })
      .sort({ sequence: 1 })
      .limit(limit);

      // If we don't have enough sequenced articles, fill with priority articles
      if (sliderArticles.length < limit) {
        const remaining = limit - sliderArticles.length;
        const priorityArticles = await Article.find({
          ...obj,
          priority: true,
          sequence: { $ne: 1, $ne: 2 },
          status: 'online'
        })
        .sort({ createdAt: -1 })
        .limit(remaining);
        
        responseHandler(res, [...sliderArticles, ...priorityArticles]);
      } else {
        responseHandler(res, sliderArticles);
      }
    } catch (error) {
      errHandler(res, error, 500);
    }
    return;
  }

  if (priority) {
    limit = Number(limit || 6);
    try {
      // Modified priority query to include all priority articles regardless of newsType
      const priorityArticles = await Article.find({
        ...obj,
        priority: true,
        status: 'online'
      })
      .sort({ createdAt: -1 })
      .limit(limit);
      
      responseHandler(res, priorityArticles);
    } catch (error) {
      errHandler(res, error, 500);
    }
    return;
  }

  page = Number(page || 1);
  limit = Number(limit || 6);
  const skip = (page - 1) * limit;

  try {
    if (pagenation) {
      const data = await Article.find(obj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      responseHandler(res, data);
    } else {
      const data = await Article.find(obj)
        .sort({ createdAt: -1 });
      const updatedData = data.map((item) => ({
        ...item.toObject(),
        shareUrl: `https://test-backend-news.vercel.app/api/shareUrl?relocation=${url}&id=${id}`,
      }));
      responseHandler(res, updatedData);
    }
  } catch (error) {
    errHandler(res, error, 500);
  }
};

//controller for set meta tags in whatsapp
const shareUrl = async (req, res) => {
  const { relocation, id } = req.query;

  // Helper function to detect if the request is from a bot/crawler
  const isCrawler = (userAgent) => {
    const crawlers = [
      "WhatsApp",
      "facebookexternalhit",
      "Twitterbot",
      "Slackbot",
      "LinkedInBot",
    ];
    return crawlers.some((crawler) => userAgent.includes(crawler));
  };

  const userAgent = req.headers["user-agent"];

  // Check if the request is from a crawler
  if (isCrawler(userAgent)) {
    try {
      const data = await Article.findById(id);

      if (!data) {
        return res.status(404).send("Article not found");
      }

      // Strip HTML tags from the description
      const plainDescription = data.discription.replace(/<\/?[^>]+(>|$)/g, "");

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta property="og:title" content="${data.title}">
          <meta property="og:description" content="${plainDescription}">
          <meta property="og:image" content="${data.image}">
          <meta property="og:url" content="${relocation}">
          <meta property="og:type" content="article">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="${data.title}">
          <meta name="twitter:description" content="${plainDescription}">
          <meta name="twitter:image" content="${data.image}">
          <title>${data.title}</title>
        </head>
        <body>
          <h1>${data.title}</h1>
          <p>${plainDescription}</p>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).send("Server error");
    }
  } else {
    // If the request is not from a crawler, redirect the user
    if (relocation) {
      res.redirect(relocation);
    } else {
      res.status(400).send("Bad request: Missing relocation URL");
    }
  }
};

const DeleteArticle = (req, res) => {
  const { id } = req.query;
  // console.log(id);
  Article.findByIdAndDelete({ _id: id }).then((data) => {
    responseHandler(res, data);
  });
};
const ReportArticle = (req, res) => {
  const { adminId, userId, question, articleId } = req.body;
  // console.log(req.body);
  Report.create({ adminId, userId, articleId, question })
    .then(async (data) => {
      await Article.findByIdAndUpdate(
        { _id: articleId },
        { approved: true },
        { new: true }
      );
      responseHandler(res, data);
    })
    .catch((err) => {
      errHandler(res, err, 404);
    });
};
const GetReportArticle = (req, res) => {
  const { adminId, userId } = req.query;
  let obj = {};
  if (adminId) {
    obj.adminId = adminId;
  }
  if (userId) {
    obj.userId = userId;
  }
  Report.find(obj).then(async (data) => {
    responseHandler(res, data);
  });
};
const answerReportArticle = (req, res) => {
  const { id, answer } = req.body;
  Report.findByIdAndUpdate({ _id: id }, { answer }, { new: true }).then(
    async (data) => {
      responseHandler(res, data);
    }
  );
};
const DashboardReport = async (req, res) => {
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

    // Find all reports and apply date filtering criteria if provided
    const allReports = await Report.find(dateFilter);

    // Count the number of reports created today
    const todayData = await Report.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    // Count of active reports
    const activeCount = allReports.length;

    // Inactive count is always 0 for reports
    const inactiveCount = 0;

    res.json({ activeCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const adminGetArticle = (req, res) => {
  const { id } = req.params;
  User.findOne({ _id: id, role: "admin" })
    .then(() => {
      Article.find({ approved: false }).then((data) => {
        responseHandler(res, data);
      });
    })
    .catch(() => {
      errHandler(res, "not Found", 404);
    });
};
// const PostArticle = async (req, res) => {
//   const {
//     title,
//     discription,
//     topic,
//     keyWord,
//     language,
//     reportedBy,
//     publishBy,
//     newsType,
//     image,
//     type,
//     subCategory,
//     acsses,
//     comment
//   } = req.body;
//   // console.log(body);
//   const { id } = req.params;
//   let date = new Date();
//   date = JSON.stringify(date).split("T")[0].split('"')[1];
//   Article.create({
//     UserID: id,
//     title,
//     discription,
//     topic,
//     keyWord,
//     language,
//     reportedBy,
//     publishBy,
//     newsType,
//     image,
//     date,
//     type,
//     subCategory,
//     acsses,
//     comment
//   })
//     .then((data) => {
//       responseHandler(res, data);
//     })
//     .catch((err) => {
//       errHandler(res, JSON.stringify(err), 403);
//     });
// };
const PostArticle = async (req, res) => {
  const {
    title,
    discription,
    topic,
    keyWord,
    language,
    reportedBy,
    publishBy,
    newsType,
    image,
    type,
    subCategory,
    acsses,
    comment,
    slug,
    priority,
    slider,
    publishAt, // Add this new field
    status = 'online' // Default to published if not specified
  } = req.body;

  const { id } = req.params;
  let date = new Date();
  date = JSON.stringify(date).split("T")[0].split('"')[1];

  let idPrefix = "LOK";
  let translatedTopic = topic;

  try {
    const result = await translate(topic, { from: 'hi', to: 'en' });
    translatedTopic = result.text.toLowerCase(); 
  } catch (translationError) {
    console.error("Translation error, using original text:", translationError);
  }

  const customId =
    translatedTopic +
    Date.now().toString().substring(0, 10);

  console.log("Custom ID:", customId);

  // Determine the actual status based on publishAt
  const finalStatus = publishAt && new Date(publishAt) > new Date() 
    ? 'scheduled' 
    : status;

  Article.create({
    _id: customId,
    UserID: id,
    title,
    discription,
    topic,
    keyWord,
    language,
    reportedBy,
    publishBy,
    newsType,
    image,
    date,
    type,
    subCategory,
    acsses,
    comment,
    slug,
    priority,
    slider,
    // Add these new fields
    publishAt: publishAt || new Date(),
    status: finalStatus
  })
    .then((data) => {
      responseHandler(res, data);
    })
    .catch((err) => {
      errHandler(res, JSON.stringify(err), 403);
    });
};


const imageUpload = async (req, res) => {
  // console.log(req.body, "ff");
  // console.log(req.file ? req.file : null);
  const metadata = {
    contentType: req.file.mimetype,
  };
  const storageRef = ref(
    Storage,
    `uploads/${req.file.fieldname + "_" + Date.now()}`
  );
  // console.log(storageRef);
  //     const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21]);
  await uploadBytesResumable(storageRef, req.file.buffer, metadata).then(
    (snap) => {
      // console.log("success");
      getDownloadURL(storageRef).then((url) => {
        responseHandler(res, { image: url });
      });
    }
  );
};
const approvedArticle = (req, res) => {
  let { id } = req.params;
  let body = req.body;
  console.log("id of data");
  Article.findByIdAndUpdate({ _id: id }, body, { new: true })
    .then((data) => {
      responseHandler(res, {
        data,
      });
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};

const ArticleContent = (req, res) => {
  console.log("Tages test",req.body);
  const { id } = req.query; // `id` is the adminId
  const { text, type, sequence } = req.body;
  console.log("Test text atul", text)
  // Validation for type
  if (!["tag", "category"].includes(type)) {
    return errHandler(res, "Invalid type. Must be 'tag' or 'category'.", 400);
  }

  // Validation for sequence (only for 'category')
  if (type === "category" && (sequence === undefined || sequence === null)) {
    return errHandler(res, "Sequence is required for type 'category'.", 400);
  }

  // Check if a category with the same sequence already exists (only for category)
  if (type === "category") {
    Content.findOne({ type: "category", sequence })
      .then((existingCategory) => {
        if (existingCategory) {
          return errHandler(
            res,
            "A category with this sequence already exists.",
            400
          );
        }

        // Prepare content data for category
        const contentData = {
          type,
          adminId: id,
          text,
          sequence,
        };
         console.log("content data", contentData)
        // Create category content
        Content.create(contentData)
          .then((data) => {
            responseHandler(res, data);
          })
          .catch((error) => {
            console.error("Error creating content:", error);
            errHandler(res, "Content was not created", 403);
          });
      })
      .catch((error) => {
        console.error("Error checking for existing category:", error);
        errHandler(res, "Error checking for existing category", 500);
      });
  } else if (type === "tag") {
    // Check if a tag with the same text already exists
    Content.findOne({ type: "tag", text })
      .then((existingTag) => {
        if (existingTag) {
          return errHandler(res, "A tag with this text already exists.", 400);
        }

        // Prepare content data for tag
        const contentData = {
          type,
          adminId: id,
          text,
        };

        // Create tag content
        Content.create(contentData)
          .then((data) => {
            responseHandler(res, data);
          })
          .catch((error) => {
            console.error("Error creating content:", error);
            errHandler(res, "Content was not created", 403);
          });
      })
      .catch((error) => {
        console.error("Error checking for existing tag:", error);
        errHandler(res, "Error checking for existing tag", 500);
      });
  }
};


// const ArticleContent = async (req, res) => {
//   try {
//     console.log("Tages test", req.body);
//     const { id } = req.query; // `id` is the adminId
//     const { text, type, sequence } = req.body;
//     console.log("Test text atul", text);

//     // Validation for type
//     if (!["tag", "category"].includes(type)) {
//       return errHandler(res, "Invalid type. Must be 'tag' or 'category'.", 400);
//     }

//     // Validation for sequence (only for 'category')
//     if (type === "category" && (sequence === undefined || sequence === null)) {
//       return errHandler(res, "Sequence is required for type 'category'.", 400);
//     }

//     // Translate Hindi to English
//     let translatedText = text;
//     try {
//       const result = await translate(text, { from: 'hi', to: 'en' });
//       translatedText = result.text.toLowerCase(); // Get "play" instead of "khel"
//     } catch (translationError) {
//       console.error("Translation error, using original text:", translationError);
//       // Fallback to original text if translation fails
//     }

//     // Prepare content data
//     const contentData = {
//       type,
//       adminId: id,
//       text: translatedText, // Using translated text
//       ...(type === 'category' && { sequence })
//     };


//     console.log("test translate text", contentData)
//     // Check for existing item
//     const query = type === 'category' 
//       ? { type, sequence } 
//       : { type, text: translatedText };

//     const existingItem = await Content.findOne(query);
//     if (existingItem) {
//       const errorMsg = type === 'category' 
//         ? "A category with this sequence already exists." 
//         : "A tag with this text already exists.";
//       return errHandler(res, errorMsg, 400);
//     }

//     // Create content
//     const data = await Content.create(contentData);
//     responseHandler(res, data);

//   } catch (error) {
//     console.error("Error:", error);
//     errHandler(res, "An error occurred while processing your request", 500);
//   }
// };

const ArticleContentSequenceEdit = async (req, res) => {
  const { id, sequence } = req.body;

  try {
    // Fetch the content to determine its type
    const content = await Content.findById(id);

    if (!content) {
      return errHandler(res, "Content not found", 404);
    }

    // Sequence editing is only allowed for 'category'
    if (content.type === "tag") {
      return errHandler(res, "Sequence cannot be edited for type 'tag'.", 400);
    }

    if (content.type === "category") {
      // Validate sequence for 'category'
      if (sequence === undefined || sequence === null) {
        return errHandler(
          res,
          "Sequence is required for type 'category'.",
          400
        );
      }

      // Check for duplicate sequence in the database
      const duplicateContent = await Content.findOne({
        type: "category",
        sequence: sequence,
        _id: { $ne: id }, // Exclude the current content
      });

      if (duplicateContent) {
        return errHandler(
          res,
          "Sequence already exists for this category.",
          409
        );
      }

      // Update the sequence
      content.sequence = sequence;

      const updatedContent = await content.save();
      return responseHandler(res, updatedContent);
    }
  } catch (error) {
    console.error("Error editing content:", error);
    return errHandler(res, "Content was not edited", 500);
  }
};

const ArticleContentDelete = (req, res) => {
  const { id } = req.params;
  console.log(id);
  Content.findByIdAndDelete({ _id: id })
    .then((data) => {
      responseHandler(res, {
        message: "Content Deleted Successfully",
        data: data,
        status: 200,
      });
    })
    .catch(() => {
      errHandler(res, "Article Content was not Deleted", 403);
    });
};
const ArticleContentGet = (req, res) => {
  let { id, adminId, type, page, limit } = req.query;
  let obj = {};
  if (id) {
    obj.id = id;
  }
  if (type) {
    obj.type = type;
  }
  if (adminId) {
    obj.adminId = adminId;
  }
  Content.find(obj)
    .then((data) => {
      responseHandler(res, data);
    })
    .catch(() => {
      errHandler(res, "Article Content was not Deleted", 403);
    });
};
const DashboardContent = async (req, res) => {
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

    // Find all categories and apply date filtering criteria if provided
    const allCategories = await Content.find(dateFilter);

    // Count of categories
    const categoryCount = allCategories.length;

    // Inactive count is always 0
    const inactiveCount = 0;

    // Today's data count
    const today = new Date();
    const todayData = await Content.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    res.json({ activeCount: categoryCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const DashboardSubCategory = async (req, res) => {
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

    // Find all subcategories and apply date filtering criteria if provided
    const allSubCategories = await SubCategory.find(dateFilter);

    // Count of subcategories
    const subCategoryCount = allSubCategories.length;

    // Inactive count is always 0
    const inactiveCount = 0;

    // Today's data count
    const today = new Date();
    const todayData = await SubCategory.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    res.json({ activeCount: subCategoryCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSubCategory = async (req, res) => {
  let body = req.body;
  console.log(body);
  if (SubCategory && (await SubCategory.findOne({ text: body.text }))) {
    errHandler(res, "Sub Category ALready Axist", 401);
    return;
  }
  SubCategory.create(body)
    .then((data) => {
      responseHandler(res, data);
    })
    .catch((err) => {
      // console.log(err);
      errHandler(res, "Sub Category Was Not Create", 403);
    });
};

const getSubCategory = (req, res) => {
  let { category } = req.query;
  let obj = {};
  if (category) {
    obj.category = category;
  }
  SubCategory.find(obj)
    .then((data) => {
      responseHandler(res, data);
    })
    .catch(() => {
      errHandler(res, "Sub Category Was Not Create", 403);
    });
};
const dashBoardBreakingNews = async (req, res) => {
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

    // Find all articles where newsType is "breakingNews" and apply date filtering criteria if provided
    const breakingNewsArticles = await Article.find({
      newsType: "breakingNews",
      ...dateFilter,
    });

    // Count the number of breaking news articles created today
    const today = new Date();
    const todayData = await Article.countDocuments({
      newsType: "breakingNews",
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Find active articles (status: "online")
    const activeArticles = breakingNewsArticles.filter(
      (article) => article.status === "online"
    );

    // Find inactive articles (status: "offline")
    const inactiveArticles = breakingNewsArticles.filter(
      (article) => article.status === "offline"
    );

    // Count of all articles where breaking news has status "online"
    const activeCount = activeArticles.length;

    // Count of all articles where breaking news has status "offline"
    const inactiveCount = inactiveArticles.length;

    res.json({ activeCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const dashBoardTopStories = async (req, res) => {
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

    // Find all articles where newsType is "topStories" and apply date filtering criteria if provided
    const topStoriesArticles = await Article.find({
      newsType: "topStories",
      ...dateFilter,
    });

    // Count the number of top stories articles created today
    const today = new Date();
    const todayData = await Article.countDocuments({
      newsType: "topStories",
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Find active articles (status: "online")
    const activeArticles = topStoriesArticles.filter(
      (article) => article.status === "online"
    );

    // Find inactive articles (status: "offline")
    const inactiveArticles = topStoriesArticles.filter(
      (article) => article.status === "offline"
    );

    // Count of all articles where top stories has status "online"
    const activeCount = activeArticles.length;

    // Count of all articles where top stories has status "offline"
    const inactiveCount = inactiveArticles.length;

    res.json({ activeCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const dashBoardUpload = async (req, res) => {
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

    // Find all articles where newsType is "topStories" and apply date filtering criteria if provided
    const topStoriesArticles = await Article.find({
      newsType: "upload",
      ...dateFilter,
    });

    // Count the number of top stories articles created today
    const today = new Date();
    const todayData = await Article.countDocuments({
      newsType: "upload",
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Find active articles (status: "online")
    const activeArticles = topStoriesArticles.filter(
      (article) => article.status === "online"
    );

    // Find inactive articles (status: "offline")
    const inactiveArticles = topStoriesArticles.filter(
      (article) => article.status === "offline"
    );

    // Count of all articles where top stories has status "online"
    const activeCount = activeArticles.length;

    // Count of all articles where top stories has status "offline"
    const inactiveCount = inactiveArticles.length;

    res.json({ activeCount, inactiveCount, todayData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const dashBoardCategoryArticles = async (req, res) => {
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

    // Fetch all distinct categories
    const categories = await Content.find({ type: "category" });

    // Initialize an object to store counts for each category
    const categoryCounts = {};

    // Loop through each category and fetch articles for it
    for (const category of categories) {
      const articles = await Article.find({
        topic: category.text,
        ...dateFilter,
      });

      // Count the number of top stories articles created today for this category
      const today = new Date();
      const todayData = await Article.countDocuments({
        topic: category.text,
        newsType: "topStories",
        createdAt: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lte: new Date(today.setHours(23, 59, 59, 999)),
        },
      });

      // Find active articles (status: "online") for this category
      const activeArticles = articles.filter(
        (article) => article.status === "online"
      );

      // Find inactive articles (status: "offline") for this category
      const inactiveArticles = articles.filter(
        (article) => article.status === "offline"
      );

      // Count of all articles for this category where top stories has status "online"
      const activeCount = activeArticles.length;

      // Count of all articles for this category where top stories has status "offline"
      const inactiveCount = inactiveArticles.length;

      // Store counts for this category
      categoryCounts[category.text] = { activeCount, inactiveCount, todayData };
    }

    res.json(categoryCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Slider Fix Babloo 28-06
// Reset article positions
const resetArticlePositions = async (req, res) => {
  try {
    const result = await Article.updateMany(
      { sequence: { $in: [1, 2] } },
      { 
        $set: { 
          sequence: null,
          slider: false
        } 
      }
    );
    
    res.status(200).json({ 
      success: true,
      message: 'Positions reset successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error resetting positions:", error);
    res.status(500).json({ 
      success: false,
      message: 'Error resetting positions',
      error: error.message 
    });
  }
};

// Update article sequence
const updateArticleSequence = async (req, res) => {
  try {
    const { articleId, sequence } = req.body;
    
    if (!articleId || !sequence || ![1, 2].includes(sequence)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid request. Article ID and sequence (1 or 2) are required' 
      });
    }

    // First clear any existing article with this sequence
    await Article.updateOne(
      { sequence },
      { $set: { sequence: null, slider: false } }
    );

    // Then update the new article
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      { 
        $set: {
          sequence,
          slider: true,
          priority: true
        } 
      },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ 
        success: false,
        message: 'Article not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article sequence updated successfully',
      article: updatedArticle
    });
  } catch (error) {
    console.error("Error updating article sequence:", error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating article sequence',
      error: error.message 
    });
  }
};

export {
  resetArticlePositions,
  updateArticleSequence,
  getArticle,
  adminGetArticle,
  PostArticle,
  approvedArticle,
  DeleteArticle,
  imageUpload,
  ReportArticle,
  DashboardReport,
  GetReportArticle,
  answerReportArticle,
  ArticleContent,
  ArticleContentSequenceEdit,
  ArticleContentDelete,
  ArticleContentGet,
  createSubCategory,
  getSubCategory,
  dashBoardBreakingNews,
  dashBoardTopStories,
  DashboardContent,
  DashboardSubCategory,
  dashBoardUpload,
  dashBoardCategoryArticles,
  shareUrl,
};
