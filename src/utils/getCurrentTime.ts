const getCurrentTime = () => {
  const date_time = new Date();

  // get current date
  // adjust 0 before single digit date
  const date = date_time.getDate();

  // get current month
  const month = date_time.getMonth();

  // get current year
  const year = date_time.getFullYear();

  // get current hours
  const hours = date_time.getHours();

  // get current minutes
  const minutes = date_time.getMinutes();

  // get current seconds
  const seconds = date_time.getSeconds();

  // prints date in YYYY-MM-DD format

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  return (
    "[" +
    year +
    "-" +
    (month > 9 ? month : `0${month}`) +
    "-" +
    (date > 9 ? date : `0${date}`) +
    " " +
    (hours > 9 ? hours : `0${hours}`) +
    ":" +
    (minutes > 9 ? minutes : `0${minutes}`) +
    ":" +
    (seconds > 9 ? seconds : `0${seconds}`) +
    "]"
  );
};

export default getCurrentTime;
