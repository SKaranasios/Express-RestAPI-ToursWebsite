//fn is the async function which returns a promise
//if there is an error in promise we catch it
module.exports = fn => {
  return (req, res, next) => {
    //global handle middleware
    fn(req, res, next).catch(err => next(err));
  };
};
