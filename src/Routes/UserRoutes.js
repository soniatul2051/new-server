import express from "express";
import {
  DashBoradUser,
  DeleteUser,
  LoginUser,
  NewPassword,
  RegisterdUser,
  changePassword,
  changeRegister,
  changeRole,
  forgotPassword,
  getUser,
  otpResend,
  otpVerify,
} from "../Controllers/UserController.js";
import {
  ArticleContent,
  ArticleContentDelete,
  ArticleContentGet,
  ArticleContentSequenceEdit,
  DashboardContent,
  DashboardReport,
  DashboardSubCategory,
  DeleteArticle,
  GetReportArticle,
  PostArticle,
  ReportArticle,
  adminGetArticle,
  answerReportArticle,
  approvedArticle,
  createSubCategory,
  dashBoardBreakingNews,
  dashBoardCategoryArticles,
  dashBoardTopStories,
  dashBoardUpload,
  getArticle,
  getSubCategory,
  imageUpload,
  shareUrl,
  resetArticlePositions,
  updateArticleSequence
} from "../Controllers/ArticleController.js";
import { upload } from "../middleware/index.js";
import {
  Ads,
  ClickAds,
  DashboardAds,
  GetAds,
  DeleteAds,
  IncrementNoOfImpression,
  approvedAds,
} from "../Controllers/AdsController.js";
import {
  DashBoardLive,
  DeleteLiveStream,
  GetLiveStream,
  LiveStream,
} from "../Controllers/LiveController.js";
import {
  DashBoardComment,
  DeleteComment,
  GetComment,
  OnComment,
} from "../Controllers/CommentController.js";
import {
  DashboardPoll,
  createPoll,
  getAllPolls,
  deletePools,
  updatePool,
} from "../Controllers/PollController.js";
import {
  DashBoardFlashNews,
  getAllNews,
  updateNews,
  updateNewsStatus,
  uploadNews,
} from "../Controllers/FlashNewsController.js";
import {
  DashBoardStories,
  DeleteStory,
  approvedStories,
  createStory,
  getAllStories,
} from "../Controllers/StoryController.js";
import {
  DashBoardVideos,
  DeleteVideo,
  approvedVideos,
  createVideo,
  getAllVideos,
  getVideo,
} from "../Controllers/videoController.js";
import {
  DashBoardPhotos,
  DeletePhoto,
  approvedPhotos,
  createPhoto,
  getPhotoById,
  getAllPhotos,
} from "../Controllers/photoController.js";
import {
  createSubscription,
  deleteSubscription,
  getallSubscription,
} from "../Controllers/newsLetterController.js";

const route = express.Router();

route.route("/registerd").post(RegisterdUser);
route.route("/login").post(LoginUser);
route.route("/resendOTP").post(otpResend);
route.route("/verify").post(otpVerify);
route.route("/role").put(changeRole);
route.route("/change-user-password").put(changePassword);
route.route("/register").put(changeRegister);
route.route("/user").get(getUser).delete(DeleteUser);
route.route("/article").get(getArticle).delete(DeleteArticle);
route.route("/article/:id").put(approvedArticle).post(PostArticle);
route.route("/article/reset-positions").put(resetArticlePositions);
route.route("/article/update-sequence").put(updateArticleSequence);
// route.route("/article").get(getArticle).delete(DeleteArticle);

// Slider Reset Api Babloo 28-06
// PUT /article/reset-positions
route.route("/shareUrl").get(shareUrl);

route.route("/story").post(createStory);
route.route("/story").get(getAllStories).delete(DeleteStory);
route.route("/story/:id").put(approvedStories);

route.route("/video").post(createVideo);
route.route("/video").get(getAllVideos).delete(DeleteVideo);
route.route("/video/:id").put(approvedVideos);
route.route("/video/:id").get(getVideo);

route.route("/photo").post(createPhoto);
route.route("/photo").get(getAllPhotos).delete(DeletePhoto);
route.route("/photo/:id").put(approvedPhotos);
route.route("/photo/:id").get(getPhotoById);

route
  .route("/newsletter")
  .post(createSubscription)
  .get(getallSubscription)
  .delete(deleteSubscription);

route.route("/publish/:id").get(adminGetArticle);
route.route("/image").post(upload.single("file"), imageUpload);
route.route("/forgot").post(forgotPassword).put(NewPassword);
route
  .route("/report")
  .post(ReportArticle)
  .get(GetReportArticle)
  .put(answerReportArticle);
route
  .route("/content")
  .post(ArticleContent)
  .put(ArticleContentSequenceEdit)
  .get(ArticleContentGet);
route.route("/delete_content/:id").delete(ArticleContentDelete);

route.route("/ads").get(GetAds).post(Ads);
route.route("/ads/click").get(IncrementNoOfImpression).post(ClickAds);
route.route("/ads/:id").put(approvedAds);
route.route("/ads_delete/:id").delete(DeleteAds);

route.route("/flashnews").post(uploadNews).get(getAllNews);
route.route("/flashnews/:id/edit").put(updateNews);
route.route("/flashnews/:id/status").put(updateNewsStatus);
route.route("/live").get(GetLiveStream).post(LiveStream);
route.route("/live/:id").delete(DeleteLiveStream);
route.route("/comment").get(GetComment).post(OnComment).delete(DeleteComment);

route.route("/polls").post(createPoll).get(getAllPolls);
route.route("/polls/:id/vote").post(updatePool);
route.route("/subcategory").get(getSubCategory).post(createSubCategory);
route.route("/delete_pool/:id").delete(deletePools);

route.route("/dashboard/users").get(DashBoradUser);
route.route("/dashboard/breakingNews").get(dashBoardBreakingNews);
route.route("/dashboard/topStories").get(dashBoardTopStories);
route.route("/dashboard/uploads").get(dashBoardUpload);
route.route("/dashboard/ads").get(DashboardAds);
route.route("/dashboard/flashNews").get(DashBoardFlashNews);
route.route("/dashboard/stories").get(DashBoardStories);
route.route("/dashboard/videos").get(DashBoardVideos);
route.route("/dashboard/photos").get(DashBoardPhotos);
route.route("/dashboard/comments").get(DashBoardComment);
route.route("/dashboard/live").get(DashBoardLive);
route.route("/dashboard/poll").get(DashboardPoll);
route.route("/dashboard/report").get(DashboardReport);
route.route("/dashboard/content").get(DashboardContent);
route.route("/dashboard/subCategory").get(DashboardSubCategory);
// different format than the rest of the above dashboards data
route.route("/dashboard/categroyAritcles").get(dashBoardCategoryArticles);

export default route;
