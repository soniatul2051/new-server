import { AdsS } from "../Models/AdsSchema.js";
import { errHandler, responseHandler } from "../helper/response.js";

const Ads = (req, res) => {
  let body = req.body;
  let { id } = req.query;
  let { noOfImpression } = req.body;
  console.log(typeof body.StartAt, body.EndAt);

  let StartAt = new Date(body.StartAt);
  let EndAt = new Date(body.EndAt);

  body.noOfImpression = noOfImpression;
  AdsS.create({ ...body, userId: id, StartAt, EndAt })
    .then((data) => {
      responseHandler(res, data);
    })
    .catch((err) => {
      console.log(err);
      errHandler(res, 5, 403);
    });
};

const GetAds = (req, res) => {
  let { side, active } = req.query;
  let obj = {};
  if (side) {
    obj.side = side;
  }
  let currentDate = Date.now();
  AdsS.find(obj)
    .then((data) => {
      let arr = [];
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        if (active) {
          let StartAt = currentDate >= new Date(element.StartAt);
          let EndAt = currentDate <= new Date(element.EndAt);

          if (StartAt && EndAt) {
            arr.push(element);
          }
        }
      }

      responseHandler(res, active ? arr : data);
    })
    .catch((err) => {
      console.log(err);
      errHandler(res, 5, 403);
    });
};

async function IncrementNoOfImpression(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Ad ID is required" });
    }

    // Find the ad by ID
    const ad = await AdsS.findById(id);

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Increment noOfImpressions by 1
    ad.noOfImpression += 1;

    // Save the updated ad
    await ad.save();

    return res
      .status(200)
      .json({ message: "Impression incremented successfully" });
  } catch (error) {
    console.error("Error while incrementing impressions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const ClickAds = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Ad ID is required" });
  }

  try {
    const updatedAd = await incrementNoAdsById(id);
    return res.json(updatedAd);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
async function incrementNoAdsById(adId) {
  try {
    const updatedAd = await AdsS.findByIdAndUpdate(
      adId,
      { $inc: { noAds: 1 } },
      { new: true }
    );

    if (!updatedAd) {
      throw new Error("Ad not found");
    }

    return updatedAd;
  } catch (error) {
    throw new Error(`Error incrementing noAds: ${error.message}`);
  }
}

const approvedAds = (req, res) => {
  let { id } = req.params;
  let body = req.body;

  AdsS.findByIdAndUpdate({ _id: id }, body, { new: true })
    .then((data) => {
      responseHandler(res, {
        data,
      });
    })
    .catch((err) => {
      errHandler(res, 5, 409);
    });
};

const DeleteAds = (req, res) => {
  const { id } = req.params;
  console.log(id);
  AdsS.findByIdAndDelete({ _id: id }).then((data) => {
    responseHandler(res, {
      message: "Advertisement Deleted Successfully",
      data: data,
      status: 200,
    });
  });
};

const DashboardAds = async (req, res) => {
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

    // Find all ads and apply date filtering criteria if provided
    const allAds = await AdsS.find(dateFilter);

    // Count the number of ads created today
    const today = new Date();
    const todayData = await AdsS.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Filter active ads
    const activeAds = allAds.filter((ad) => ad.active);

    // Filter inactive ads
    const inactiveAds = allAds.filter((ad) => !ad.active);

    // Count of active ads
    const activeAdsCount = activeAds.length;

    // Count of inactive ads
    const inactiveAdsCount = inactiveAds.length;

    res.json({
      activeCount: activeAdsCount,
      inactiveCount: inactiveAdsCount,
      todayData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  Ads,
  GetAds,
  ClickAds,
  DeleteAds,
  IncrementNoOfImpression,
  approvedAds,
  DashboardAds,
};
