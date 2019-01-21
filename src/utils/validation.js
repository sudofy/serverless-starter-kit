import joi from "joi";
import * as R from "ramda";

export default joiError =>
  R.path(["error", "details", 0, "message"], joiError);
