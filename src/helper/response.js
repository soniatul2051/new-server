import errList from "./errList.js";

const responseHandler = (res, data) => {
  res.status(200);
  res.json(data);
};

const errHandler = (res, err, status) => {
  console.log(typeof err);
  res.status(status);
  if (typeof err == "string") {
    res.json({ err });
  } else {
    res.json({ err: errList[err] });
  }
};

export { responseHandler, errHandler };
